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

function serverRegsiterAI (aiPlayer) {
	enableAI(false);
	var saved_player = session.player;
	session.player = aiPlayer;
	serverRequest ("CardEventPlayerRegister", null);
	session.player = saved_player;
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


function serverRequest (event, cards, code)
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
	if (player) {
		var name = player.name;
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
	var res = getResponseFromJson (text); 
	var event = res.event;
	var message = res.message;
	var player = res.player;
	var position = findPlayerPosition (player);
	//=============================================================
	//	BEGIN State Transition:
	//=============================================================
	if (event == "CardEventServerReject") {
		restartClient (message);
	}
	var pass = false;
	switch (gameState) {
	case "Idle":
		pass = true;
		break;
	case "NewHand":
		gameState="Idle";
		randomMove();
		pass = true;
		break;
	case "Login":
		if (event == "CardEventLoginAck") {
			pass = true;
		}
		break
	case "Shuffling":
		break;
	case "CleanupEnd":
		if (event == "CardEventDealCards") {
			pass = true;
		}
		break;
	case "PlayerReady":
		if (event == "CardEventEndRound") {
			eventQueue.unshift(text);
			prompt ("Round Over");
			gameState = "EndRound";
			return;
		}
		if (event == "CardEventScoreBoard") {
			gameState = "NewHand";
		}
		pass = true;
		break;
	case "FaceUpResponse":
		if (event == "CardEventGameIdle" ||
			event == "CardEventFaceUpResponse" ||
			event == "CardEventPlayerAutoAction") {
			pass = true;
		}
		break;
	case "PlayerTurnResponse":
		if (event == "CardEventGameIdle" ||
			event == "CardEventPlayerAutoAction") {
			pass = true;
		}
		break;
	case "EndRound":
		if (event == "CardEventEndRound") {
			pass = true;
		}
		break;
	default:
		break;
	}
	if (!pass) {
		eventQueue.unshift(text);
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
		if (session.player == res.player.name) {
			if (status == "OK") {
				myPosition = player.position;
				session.code = res.new_code;
				startGame ();
			}
			else {
				restartClient (message);
			}
		}
		enableAI (true);
		break;
	case "CardEventPlayerRegister":
		if (res.player_list) {
			var player_list = res.player_list;
			for (i = 0; i < player_list.length; ++i) {
				var p = (player_list[i].position - myPosition + 4) % 4;
				setPlayer (p, player_list[i].name);
			}
		}
		prompt (message);
		break;
	case "CardEventShuffleEffect":
		gameState = "Shuffling";
		prompt (message);
		cleanup ();
		break;
	case "CardEventDealCards":
		dealCards (res.player.hand);
		break;
	case "CardEventFaceUp":
		faceupReady (res.rule.reason, res.rule.allowed);
		break;
	case "CardEventFaceUpResponse":
		showFaceup (position, res.card_played);
		break;
	case "CardEventTurnToPlay":
		playerReady (position, res.rule);
		break;
	case "CardEventPlayerAction":
		playCard (position, res.card_played);
		break;
	case "CardEventPlayerAutoAction":
		autoPlayCard ();
		break;
	case "CardEventEndRound":
		discardCards (position, res.points_this_round);
		gameState = "PlayerReady";
		break;
	case "CardEventScoreBoard":
		score (res.player_list, res.lines, res.faceup);
		break;
	case "CardEventPlayerReconnect":
		prompt (message);
		if (res.player_list.length > 3) {
			gameState = "Reconnect";
			cleanup ();
			setPlayerDisplay (res.player_list);
		}
		else {
			setPlayerDisplayOnly (res.player_list);
			
		}
		break;
	case "CardEventGameIdle":
		if (autoPlayGame && (gameState == "PlayerTurnResponse" || gameState == "FaceUpResponse")) {
			sendAutoPlayAction ();
		}
		break
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
	var response = {
			event: "CardEventPlayerAutoAction",
			message: "Auto Player is on",
			player: {
				name: session.player
			}
	}
	eventQueue.unshift (JSON.stringify(response));
}

function getResponseFromJson (text) {
	return JSON.parse (text);
}