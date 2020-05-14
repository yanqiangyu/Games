// *******************************************************************************
// Server Event Handling
// HTTP based XML response assumed.
// JASON and other POJO protocols can be easily adapted to
// *******************************************************************************
var session = {player: "", code: "",};
var serverState="Offline";
var eventQueue=[];
var idleThread;
var pollingInterval = 500;
var idleCount=0;

function mainLoop ()
{
	if (eventQueue.length > 0 ) {
		handleResponseText (eventQueue.shift());
	}
	else {
		if (gameState != "Login") {
			serverRequest ("CardEventPlayerUpdate", null);
		}
		checkServerIdle ();
	}
}

function login (player, code) {
	gameState = "Login";
	if (idleThread == null) {
		idleThread = setInterval(mainLoop, pollingInterval); 
	}
	if (player != "" && code != "") {
		disableLogin ()
		session.player=player;
		session.code=code;
		serverRequest ("CardEventPlayerRegister", null);
		setServerState ("LoginWait");
		var timeout = setInterval(checkLogin, 1000);
		var count = 0;
		function checkLogin () {
			if (serverState == "LoginWait") {
				prompt ("Please wait..");
				setServerState ("Connecting");
			}
			else if (serverState == "Connecting" && count > 10) {
				prompt ("Timeout,  try again...");
				clearInterval (timeout);
				clearInterval (idleThread);
				setServerState ("Offline");
				enableLogin ();
			}
			++count;
		}
		return "Waiting for server response";
	}
	else if (code.toUpperCase() == "TEST") {
		session.player=testUsers[0];
		session.code=code;
		return testStart ();
	}
	return "Player/Code Required";
}

function setServerState (s) {
	serverState = s;
	if (serverState == "Connected") {
		idleCount = 0;
	}
	promptServer (serverState);
}

function checkServerIdle () {
	++idleCount;
	if (idleCount > 30) {
		setServerState ("Offline");
		if (!autoPlayGame) {
			restartClient ("Server timeout, restarting client...");
		}
	}
}

function restartClient (message) {
	if (message != "") {
		prompt (message);
	}
	gameState = "Error";
	clearInterval (idleThread);
	setTimeout (reload, 3000);
	function reload () {
		location.reload();
	}
}

function serverRequest (event, cards)
{
	var theUrl = "/cardgame?" +
		"CardEvent=" + event + 
		"&player="+ session.player +
		"&code=" +  session.code + 
		(cards == null ? "" : ("&cards=" + cards));
		
	if (testThread == null) {
	    var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
	        if (this.readyState == 4 && this.status == 200) {
	        	eventQueue.push (xhttp.responseText);
	        }
	        else if (this.status != 200 && this.status != 0) {
	           	promptServer ("Server Error! Status=" + this.status);
	           	location.reload();
	        }
	    };
	    xhttp.open("GET", theUrl, true); 
	    xhttp.send(null);
	}
}

function findPlayerPosition (player)
{
	if (player != null) {
		var name = player.getAttribute("name");
		for (i = 0; i < myPlayers.length; ++i) {
			if (myPlayers[i] == name) {
				return i;
			}
		}
	}
	return 0;
}


function handleResponseText (text)
{
	var response = new DOMParser().parseFromString(text,"text/xml");
	var event=response.getElementsByTagName("event")[0].getAttribute("name");
	var message = response.getElementsByTagName("message")[0].childNodes[0].nodeValue;
	var player = response.getElementsByTagName("player")[0];
	var position = findPlayerPosition (player);
	//=============================================================
	//	BEGIN State Transition:
	//=============================================================
	if (event == "CardEventServerReject") {
		restartClient (message);
	}
	switch (gameState) {
	case "Idle":
		break;
	case "NewHand":
		gameState="Idle";
		randomMove();
		break;
	case "Login":
		if (event == "CardEventLoginAck") {
			break;
		}
	case "CleanupEnd":
		if (event == "CardEventDealCards") {
			break;
		}
	case "PlayerReady":
		if (event == "CardEventEndRound") {
			eventQueue.unshift(text);
			prompt ("Round Over");
			gameState = "EndRound";
			return;
		}
		if (event == "CardEventFaceUp" || 
			event == "CardEventGamePlayStart" ||
			event == "CardEventShuffleEffect" ||
			event == "CardEventPlayerAction" ||
			event == "CardEventGameIdle" ||
			event == "CardEventPlayerAck" ||
			event == "CardEventFaceUpResponse" ||
			event == "CardEventTurnToPlay") {
			break;
		}
	case "FaceUpResponse":
		if (event == "CardEventFaceUpResponse" ||
			event == "CardEventGameIdle" ||
			event == "CardEventPlayerAutoAction") {
			break;
		}
	case "PlayerTurnResponse":
		if (event == "CardEventPlayerAutoAction") {
			break;
		}
	case "EndRound":
		if (event == "CardEventEndRound") {
			break;
		}
		if (event == "CardEventScoreBoard") {
			gameState = "NewHand";
			break;
		}
	default:
		eventQueue.unshift(text);
		// TODO Change to DEBUG
		// prompt ("State: " + gameState + " Pending:" + event);
		return;
	}
	//=============================================================
	//	END State Transition:
	//=============================================================
	setServerState ("Connected");
	prompt (message );
	
	switch (event) {
	case "CardEventLoginAck":
		var status = response.getElementsByTagName("status")[0].childNodes[0].nodeValue;
		if (status == "OK") {
			myPosition = parseInt(player.getAttribute("position"));
			session.code = player.getAttribute("code");
			startGame ();
		}
		else {
			restartClient (message);
		}
	case "CardEventPlayerRegister":
		var players = response.getElementsByTagName("player");
		if (players) {
			for (i = 0; i < players.length; ++i) {
				var p = (parseInt(players[i].getAttribute("position")) - myPosition + 4) % 4;
				setPlayer (p, players[i].getAttribute("name"));
			}
		}
		prompt (message);
		break;
	case "CardEventShuffleEffect":
		gameState = "PlayerReady";
		prompt (message);
		cleanup ();
		break;
	case "CardEventDealCards":
		var hand = response.getElementsByTagName("hand")[0].childNodes[0].nodeValue;
		dealCards (hand);
		break;
	case "CardEventFaceUp":
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
		faceupReady (reason, allowed);
		if (position == 0 && autoPlayGame) {
			sendAutoPlayAction ();
		}
		break;
	case "CardEventFaceUpResponse":
		var played = response.getElementsByTagName("faceup")[0].childNodes[0];
		var cards = played == null ? "NA" : played.nodeValue;
		showFaceup (position, cards);
		break;
	case "CardEventTurnToPlay":
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
		playerReady (position, reason, allowed);
		if (position == 0 && autoPlayGame) {
			sendAutoPlayAction ();
		}
		break;
	case "CardEventPlayerAction":
		var card = response.getElementsByTagName("cardPlayed")[0].getAttribute("card");
		playCard (position, card);
		break;
	case "CardEventPlayerAutoAction":
		autoPlayCard ();
		break;
	case "CardEventEndRound":
		var points = response.getElementsByTagName("player")[0].getAttribute("points");
		discardCards (position, points);
		gameState = "PlayerReady";
		break;
	case "CardEventScoreBoard":
		var players = response.getElementsByTagName("player");
		var lines = response.getElementsByTagName("line");
		var faceups = response.getElementsByTagName("faceup");
		score (players, lines, faceups);
		break;
	case "CardEventPlayerReconnect":
		gameState = "Reconnect";
		prompt (message);
		cleanup ();
		var players = response.getElementsByTagName("player");
		if (players) {
			setPlayerDisplay (players);
		}
		break;
	case "CardEventGameOver":
		gameState = "GameOver";
		prompt ("Game Over");
		cleanup ();
		clearinterval(idleThread);
		break;
	default:
		prompt (message);
	}
}

function sendAutoPlayAction () {
	var response = 
		"<event name='CardEventPlayerAutoAction'>" +
		"<message>Auto Player</message>" + 
		"<player name='" + session.player +"'/>" + 
		"</event>";
	var id = setTimeout (send, 500);
	function send () {
		eventQueue.unshift (response);
	}
}
