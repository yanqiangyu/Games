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

function findPlayerPosition (players)
{
	if (players && players[0]) {
		var name = players[0].name;
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
	var res = getResponseFromXML (text); 
	var event = res.event;
	var message = res.message;
	var players = res.players;
	var position = findPlayerPosition (players);
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
		var status = res.status;
		if (status == "OK") {
			myPosition = players[0].position;
			session.code = players[0].code;
			startGame ();
		}
		else {
			restartClient (message);
		}
	case "CardEventPlayerRegister":
		if (players) {
			for (i = 0; i < players.length; ++i) {
				var p = (players[i].position - myPosition + 4) % 4;
				setPlayer (p, players[i].name);
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
		dealCards (res.players[0].hand);
		break;
	case "CardEventFaceUp":
		faceupReady (res.rule.reason, res.rule.allowed);
		if (position == 0 && autoPlayGame) {
			sendAutoPlayAction ();
		}
		break;
	case "CardEventFaceUpResponse":
		showFaceup (position, res.players[0].faceup);
		break;
	case "CardEventTurnToPlay":
		playerReady (position, res.rule.reason, res.rule.allowed);
		if (position == 0 && autoPlayGame) {
			sendAutoPlayAction ();
		}
		break;
	case "CardEventPlayerAction":
		playCard (position, players[0].card);
		break;
	case "CardEventPlayerAutoAction":
		autoPlayCard ();
		break;
	case "CardEventEndRound":
		discardCards (position, players[0].points);
		gameState = "PlayerReady";
		break;
	case "CardEventScoreBoard":
		score (players, res.lines, res.faceup);
		break;
	case "CardEventPlayerReconnect":
		gameState = "Reconnect";
		prompt (message);
		cleanup ();
		setPlayerDisplay (players);
		break;
	case "CardEventGameOver":
		gameState = "GameOver";
		prompt ("Game Over. Thank you for playing.");
		cleanup ();
		clearInterval(idleThread);
		setServerState ("Offline");
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

function getResponseFromXML (text) {
	var dom = new DOMParser().parseFromString(text,"text/xml");
	var response = {
			event: "",
			message: "",
			players : [],
			status : "",
			lines: [],
			faceup: "",
			rule: {
				reason: "",
				allowed: ""
			},
	};
	response.event = dom.getElementsByTagName("event")[0].getAttribute("name")
	response.message = dom.getElementsByTagName("message")[0].childNodes[0].nodeValue;
	if (dom.getElementsByTagName("status")[0] && dom.getElementsByTagName("status")[0].childNodes[0]) {
		response.status = dom.getElementsByTagName("status")[0].childNodes[0].nodeValue;
	}
	if (dom.getElementsByTagName("faceup")[0] && dom.getElementsByTagName("faceup")[0].childNodes[0]) {
		response.faceup = dom.getElementsByTagName("faceup")[0].childNodes[0].nodeValue;
	}
	var rule = dom.getElementsByTagName("rule")[0];
	if (rule) {
		response.rule.reason = rule.getAttribute("reason");
		response.rule.allowed = rule.getAttribute("allowed");
	}
	var players = dom.getElementsByTagName("player");
	if (players) {
		for (i = 0; i < players.length; ++i) {
			var p = {
				name: "",
				code: "",
				points: "",
				position: 0,
				card: "",
				hand: "",
				faceup: "",
			};
			var pDoc = dom.getElementsByTagName("player")[i];
			p.name = pDoc.getAttribute("name");
			p.points = pDoc.getAttribute("points");
			p.code = pDoc.getAttribute("code");
			if(pDoc.getAttribute("position")) {
				p.position = parseInt(pDoc.getAttribute("position"));
			}
			if (pDoc.getElementsByTagName("cardPlayed")[0]) {
				p.card = pDoc.getElementsByTagName("cardPlayed")[0].getAttribute("card");
			}
			if (pDoc.getElementsByTagName("hand")[0] && pDoc.getElementsByTagName("hand")[0].childNodes[0]) {
				p.hand = pDoc.getElementsByTagName("hand")[0].childNodes[0].nodeValue;
			}
			if (pDoc.getElementsByTagName("faceup")[0] && pDoc.getElementsByTagName("faceup")[0].childNodes[0]) {
				p.faceup = pDoc.getElementsByTagName("faceup")[0].childNodes[0].nodeValue;
			}
			response.players.push(p);
		}
	}
	var lines = dom.getElementsByTagName("line");
	if (lines) {
		for (i = 0; i < lines.length; ++i) {
			response.lines.push(lines[i].childNodes[0].nodeValue);
		}
	}
	return response;
}
