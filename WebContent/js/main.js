var gameState = "Initial";
var pollingInterval = 1000;
var myCards;
var myPosition = 0;
var myPlayers = ["","","",""];
var myRound = 0;
var selectMask = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var selectedCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var maskReason = "Not your turn yet";
var center={x:0, y:0,};
var discarded=[];
var playerCards=[[],[],[],[]];
var playerPoints=[[],[],[],[]];

var carddeck=[
	{img: "2C", x: 0, y: 0,},
	{img: "2D", x: 0, y: 0,},	
	{img: "2H", x: 0, y: 0,},	
	{img: "2S", x: 0, y: 0,},	
	{img: "3C", x: 0, y: 0,},
	{img: "3D", x: 0, y: 0,},	
	{img: "3H", x: 0, y: 0,},	
	{img: "3S", x: 0, y: 0,},	
	{img: "4C", x: 0, y: 0,},
	{img: "4D", x: 0, y: 0,},	
	{img: "4H", x: 0, y: 0,},	
	{img: "5S", x: 0, y: 0,},	
	{img: "5C", x: 0, y: 0,},
	{img: "5D", x: 0, y: 0,},	
	{img: "5H", x: 0, y: 0,},	
	{img: "5S", x: 0, y: 0,},	
	{img: "6C", x: 0, y: 0,},
	{img: "6D", x: 0, y: 0,},	
	{img: "6H", x: 0, y: 0,},	
	{img: "6S", x: 0, y: 0,},	
	{img: "7C", x: 0, y: 0,},
	{img: "7D", x: 0, y: 0,},	
	{img: "7H", x: 0, y: 0,},	
	{img: "7S", x: 0, y: 0,},	
	{img: "8C", x: 0, y: 0,},
	{img: "8D", x: 0, y: 0,},	
	{img: "8H", x: 0, y: 0,},	
	{img: "8S", x: 0, y: 0,},	
	{img: "9C", x: 0, y: 0,},
	{img: "9D", x: 0, y: 0,},	
	{img: "9H", x: 0, y: 0,},	
	{img: "9S", x: 0, y: 0,},	
	{img: "XC", x: 0, y: 0,},
	{img: "XD", x: 0, y: 0,},	
	{img: "XH", x: 0, y: 0,},	
	{img: "XS", x: 0, y: 0,},	
	{img: "JC", x: 0, y: 0,},
	{img: "JD", x: 0, y: 0,},	
	{img: "JH", x: 0, y: 0,},	
	{img: "JS", x: 0, y: 0,},	
	{img: "QC", x: 0, y: 0,},
	{img: "QD", x: 0, y: 0,},	
	{img: "QH", x: 0, y: 0,},	
	{img: "QS", x: 0, y: 0,},	
	{img: "KC", x: 0, y: 0,},
	{img: "KD", x: 0, y: 0,},	
	{img: "KH", x: 0, y: 0,},	
	{img: "KS", x: 0, y: 0,},	
	{img: "AC", x: 0, y: 0,},
	{img: "AD", x: 0, y: 0,},	
	{img: "AH", x: 0, y: 0,},	
	{img: "AS", x: 0, y: 0,},	
];
// *******************************************************************************
// Control Functions:
// These functions are called by the HTML objects.
// Changing the names requires change in index.html.
// *******************************************************************************
var idleThread;
function sendLogin()
{
	var player=document.getElementById("player").value;
	var code=document.getElementById("code").value;
	gameState = "Login";
	if (idleThread == null) {
		idleThread = setInterval(mainLoop, pollingInterval); 
		logo.setAttribute('onClick', 'clickLogo()');
	}
	prompt (login (player, code));
}

function clickLogo () {
	if (gameState == "EndHand") {
		location.reload();
	}
	else {
		mainLoop ();
	}
}

function clickPlayer (p)
{
	if (p == 0) {
		var card = -1;
		var cards = "";
		var sep = "";
		for (i = 0; i < myCards.length; ++ i) {
			if (selectedCards[i] != 0) {
				cards += sep + myCards[i];
				sep = ",";
				if (gameState == "FaceUpResponse") {
					faceupMyCard (i*4);
				}
				card = i;
			}
		}
		if (card < 0 && gameState == "PlayerTurnResponse") {
			// Can't end turn without select a card;
			prompt ("Choose a card");
		}
		else if (gameState == "PlayerTurnResponse" || gameState == "FaceUpResponse") {
			var event = "";
			if (gameState == "PlayerTurnResponse") {
				playCard (0, card, myCards[card]);
				event="CardEventPlayerAction";
			}
			else {
				event="CardEventFaceUpResponse";
			}
			for (i = 0; i < myCards.length; ++ i) {
				selectedCards[i] = 0;
			}
			enableCards ("Turn Over", "");
			flashPlayer (0, false);

			request = "http://www.ialogic.com/cardgame" + 
				"?CardEvent=" + event + 
				"&player="+ session.player + 
				"&code=" + session.code +
				"&cards=" + cards;
			serverRequest (request);
			gameState="PlayerReady";
		}
	}
}

function clickCard (i)
{
	var idx = Math.floor(i/4);
	if (selectMask[idx] == 1) {
		toggleCardSelection (i)
	}
	else {
		prompt (maskReason);
	}
}

function dismissPrompt ()
{
	var c=document.getElementById("prompt");
	c.style.display="none";
}

function disableLogin ()
{
	var c=document.getElementById("login");
	c.style.display="none";
}

function enableLogin ()
{
	var c=document.getElementById("login");
	c.style.display="block";
}

// *******************************************************************************
// Game Play Functions:
// These are the functions that describes the game play
// for the event handlers/
// Low level animation effect details should be hidden from the interface
// so it can be enhanced in the future. 
// *******************************************************************************
// Basic function
//
function prompt (text)
{
	var c=document.getElementById("prompt");
	c.innerHTML=text;
	c.style.display="block";
}

function startGame() 
{
	gameState = "Idle";
	var splash = document.getElementById("splash");
	if (splash.requestFullScreen)
		splash.requestFullScreen();
	var x=document.getElementById("over");
	x.parentNode.removeChild(x);
	splash.style.backgroundImage="url('image/table.jpg')";
	splash.style.opacity="1";
	showDeck ();
	showPlayers ();
	randomMove ();
}

function showDeck ()
{
	var table=document.getElementById("splash");
	var viewwidth=parseInt(table.style.width);
	var viewheight=parseInt(table.style.height);
	var ch=viewheight / 8;
	var cw=ch*0.7;
	center.x = (viewwidth-cw) / 2 - 1;
	center.y = (viewheight-ch) / 2;
	
	for (i=0; i<52; ++i) {
		var scene=document.createElement('div');
		scene.setAttribute('id', 'scene'+i);
		scene.classList.add('card_scene', 'card_scene--card');
		table.appendChild(scene);
		scene.style.width="60px";
		scene.style.height="84px";
		scene.style.display='block';
		
		var c=document.createElement('div');
		scene.appendChild(c);
		c.setAttribute('id', 'card'+i);
		c.setAttribute('onClick', 'clickCard('+i+')');
		c.classList.add('card');
		
		var cf=document.createElement('div');
		c.appendChild(cf);
		cf.setAttribute('id', 'cardface'+i);
		cf.classList.add('card__face', 'card__face--front');
		cf.style.backgroundImage="url('image/cards/" + carddeck[i].img + ".jpg')";
		
		var cb=document.createElement('div');
		c.appendChild(cb);
		cb.classList.add('card__face', 'card__face--back');
		
		carddeck[i].x = center.x;
		carddeck[i].y = center.y;
		scene.style.left = carddeck[i].x + "vw";
		scene.style.top = carddeck[i].y + "vh";
		
		var logo=document.getElementById("logo");
	}
}

function showPlayers ()
{
	var table=document.getElementById("splash");
	for (p = 0; p < 4; ++p) {
		var l = getPlayerLocation (p);
		var view=document.createElement('div');
		table.appendChild(view);
		view.classList.add('player');
		view.style.left = l.x + 'vw';
		view.style.top = l.y + 'vh';
		view.setAttribute('id', "player"+p);
		view.setAttribute('onClick', "clickPlayer('" + p + "')");
	}
	setPlayer(0, session.player);
}

function cleanup ()
{
    var id = setInterval (work, 100);
    function work () {
    	// Wait for animation finishes
    	if (!animationPlaying) {
    		clearInterval (id);
    	    gameState = "CleanUp";
			var count = 0;
			for (i=0; i<52; ++i) {
				carddeck[i].x = center.x;
				carddeck[i].y = center.y;
				cleanCard (i)
				moveCardEffect (i, carddeck[i].x, carddeck[i].y, nextStep);
			}
			function nextStep () {
				++count;
				if (count == 52) {
					gameState = "CleanupEnd";
				}
			}
    	}
    }
}

function dealCards(hand)
{
    var id = setInterval (work, 100);
    function work () {
		// Wait for animation finishes
	  if (gameState == "CleanupEnd") {
			playerCards[0] = hand.split(",");
			for (i = 1; i < 4; ++i) {
				for (j = 0; j < 13; ++j) {
					playerCards[i].push ("NA");
				}
			}
			clearInterval (id);
			gameState = "DealCards";
			myCards = hand.split(",");
			dealCard (0, myCards);
	  }
    }
}

function dealCard (i, myCards) {
	  var l=getCardLocation (i);
	  
	  if (l.p == 0) {
		  var m = Math.floor(i/4);
		  setCardFace (i, myCards[m]);
		  flipCard(i);
	  }
	  else if (l.p == 1 || l.p == 3) {
		  rotateCard(i);
	  }
	  moveCardEffect (i, l.x, l.y, nextCard, 25, 5);
	  function nextCard () {
		  ++i;
		  if (i < 52) {
			  dealCard (i, myCards);
		  }
		  else {
			  gameState = "PlayerReady";
		  }
	  }
}

function faceupReady (reason, allowed) {
    var id = setInterval (work, 100);
    function work () {
  	  if (gameState == "PlayerReady") {
  		  	clearInterval (id);
	  		enableCards (reason, allowed);
			for (i = 0; i < 4; ++i) {
				flashPlayer(i, true);
			}
			gameState = "FaceUpResponse";
  	  }
    }
}

function showFaceup (p, c)
{
    var id = setInterval (work, 100);
    function work () {
    	if (gameState == "FaceUpResponse" || gameState == "PlayerReady") {
   		  	clearInterval (id);
			flashPlayer (p, false);
			if (c != ""  && c != "NA" && p != 0) {
				var cards=c.split(",");
				var count = cards.length;
				for (i = 0; i < cards.length; ++i) {
					var idx = p - i*4 + 48;
					var pos = getCardLocation (idx);
					setCardFace (idx, cards[i]);
					switch (p){
						case 1: pos.x -= 4; break;
						case 2: pos.y += 4; break;
						case 3: pos.x += 4; break;
					}
					flipCard (idx);
					moveCardEffect (idx, pos.x, pos.y);
					playerCards[p][12-i] = cards[i]; 
				}
			}
    	}
    }
}

function playerReady (r, position, reason, allowed)
{
    var id = setInterval (work, 100);
    function work () {
    	if (gameState == "PlayerReady") {
   		  	clearInterval (id);
			for (i = 0; i < 4; ++i) {
				flashPlayer (i, i==position);
				if (position == 0) {
					if (allowed != "") {
						enableCards (reason, allowed);
					}
					else {
						enableCards (reason, myCards[r]);
						toggleCardSelection (r*4);
					}
					gameState = "PlayerTurnResponse";
				}
			}
    	}
    }
}

function autoPlayCard ()
{
   var id = setInterval (work, 100);
    function work () {
    	if (gameState == "PlayerTurnResponse" || gameState == "FaceUpResponse") {
   		  	clearInterval (id);
		 	for (i = 0; i < selectMask.length; ++i) {
				if (selectMask[i] == 1) {
					toggleCardSelection (i*4);
					break;
				}
			}
			clickPlayer (0);
			gameState = "PlayerReady";
    	}
    }
}

function faceupMyCard (i) 
{
	var location=getCardLocation (i);
	if (location.p == 0 ) {
		var c=document.getElementById('scene'+i);
		location.y -= 4;
    	c.style.top = location.y + 'vh';
	}
}

function playCard (position, round, card) {
    var id = setInterval (work, 100);
    function work () {
    	if (gameState == "PlayerReady") {
   		  	clearInterval (id);
			var i = round * 4 + position;
			var cards = playerCards[position];
			var l = getPlayerLocation (position);
			flashPlayer (position, false);
			
			var found = false;
			for (c = cards.length; !found && c >= 0; --c) {
				found = (cards[c] == "NA" || cards[c] == card);
				if (found) {
					cards[c]="XX";
					i = c * 4 + position;
				}
			}
			faceUpCard (i);
			setCardFace (i, card);
			moveCardEffect (i, l.x+1, l.y+2.5);
			discarded.push(i);
    	}
    }
}

function discardCards (p, points) {
	var cards = points.split(",");
	var count = discarded.length;

	while (discarded.length > 0) {
		var i = discarded.shift();
		var found = false;
		var card = getCardFace (i);

		cleanCard (i);
		lowerCard (i)
		for (j = 0; !found && j < cards.length; ++j) {
			found = (card == cards[j]);
		}
		if (found) {
			playerPoints[p].push (i);
			faceUpCard (i);
			
			if (p == 1 || p == 3) {
				rotateCard (i);
			}
			var d = ((playerPoints[p].length - 1) % 13) * 4 + p;
			var m = (playerPoints[p].length < 14 ? 1 : 2);
			var dx = (p == 0 || p == 2) ? 0 : ((p == 1) ? 2 : -2);
			var dy = (p == 1 || p == 3) ? 0 : ((p == 0) ? 5 : -4);
			var l = getCardLocation (d);
			raiseCard (i, 100 + d);
			moveCardEffect (i,  l.x + dx * m, l.y + dy * m);
		}
		else {
			rotateCard (i);
			moveCardEffect (i,  center.x, center.y);
		}
	}
}

// *******************************************************************************
// Animation Module based on CSS
// *******************************************************************************
function getPlayerLocation (player) {
  // Center card position for each player;
  var l = {x: 0, y: 0,};
  
  if (player == 0) {
	  l.x = 42;
	  l.y = 60;
  }
  else if (player == 1) {
	  l.x = 59;
	  l.y = 42;
  }
  else if (player == 2) {
	  l.x = 42;
	  l.y = 23;
  }
  else  {
	  l.x = 25;
	  l.y = 42;
  }
  return l;
}

function getCardLocation (i)
{
  var player = i%4;
  var n = Math.floor(i/4);
  var x=0;
  var y=0;
  var location = {x: 0, y: 0, p:0,};
  
  if (player == 0) {
	  x = n*4 + 20;
	  y = 70;
  }
  else if (player == 1) {
	  x = 75;
	  y = 55 - n*2;
  }
  else if (player == 2) {
	  x = 69 - n*4;
	  y = 10;
  }
  else if (player == 3) {
	  x = 10;
	  y = n*2 + 30;
  }
  location.x = x;
  location.y = y;
  location.p = player;
  return location;
}

//=========================================================
// Animated card move effect
// Next effects is based on gameState for now,
// it can be improved to use a call back function
//=========================================================

function moveCardEffect (i, x, y, onComplete, step, time, flip) 
{
  step = step == null ? 50 : step;
  time = time == null ? 10 : time;
  flip = flip == null ? false : flip;
  
  var moverId = setInterval(frame, time);
  var c = document.getElementById("scene" + i);
  var fp = Math.floor (step * 0.9);
  
  function frame() {
    if (step <= 0) {
	      c.style.left=x+'vw'; 
	      c.style.top=y+'vh';  
	      clearInterval(moverId);
	      if (onComplete) {
	    	  onComplete ();
	      }
    } else {
    	  if (flip && step == fp) {
    		  flipCard(i);
    	  }
	      var cx=parseFloat(c.style.left, 10);
	      var cy=parseFloat(c.style.top, 10);
		  var dx = (x - cx) / step;
		  var dy = (y - cy) / step;
	      c.style.left=cx + dx + 'vw'; 
	      c.style.top=cy + dy + 'vh';  
	      --step;
    }
  }
}

//=========================================================
// Random effects to show when waiting  
//=========================================================
var animationPlaying = false;
function randomMove ()
{
	animationPlaying = true;
	var count = 0;
	for (i=0; i<52; ++i) {
		var x = carddeck[i].x + (Math.random() - 0.5) * 30;
		var y = carddeck[i].y + (Math.random() - 0.5) * 30;
		
		if (x > 90) x = 180 - x;
		if (y > 90) y = 180 - y;
		if (x < 10) x = 10 - x;
		if (y < 10) y = 10 - y;
		carddeck[i].x = x;
		carddeck[i].y = y;
		moveCardEffect (i, carddeck[i].x, carddeck[i].y, loopback, 100, 25, true);
	}
	function loopback () {
		count ++;
		if (count == 52 && gameState == "Idle") {
			randomMove ();
		}
		else {
			animationPlaying = false;
		}
	}
}

//=========================================================
// CSS based animation 
// Mobile CSS enhancement needed
//=========================================================
function flipCard(i)
{
	var c = document.getElementById('card'+i);
	c.classList.toggle('is-flipped');
}

function faceDownCard(i)
{
	var c = document.getElementById('card'+i);
	c.classList.toggle('is-flipped', true);
}

function faceUpCard(i)
{
	var c = document.getElementById('card'+i);
	c.classList.toggle('is-flipped', false);
}

function lowerCard(i)
{
	raiseCard (i, 50);
}

function raiseCard(i, index)
{
	var c = document.getElementById('scene'+i);
	c.style.zIndex = index; 
}

function rotateCard(i)
{
	var c = document.getElementById('scene'+i);
	c.classList.add('rotated');
}

function cleanCard (i) {
	var c = document.getElementById('card'+i);
	c.classList.toggle ('is-flipped', true);
	var s = document.getElementById('scene'+i);
	s.classList.toggle ('rotated', false);
}

function setCardFace (i, face) {
	var cf=document.getElementById('cardface'+i);
	cf.style.backgroundImage="url('image/cards/" + face + ".jpg')";
}

function getCardFace (i) {
	var face = "";
	var cf=document.getElementById('cardface'+i);
	face = String(cf.style.backgroundImage);
	face = face.substring(face.length-8, face.length-6);
	return face; 
}

function enableCards (reason, allowed)
{
	var cards=allowed.split(",");
	
	maskReason = reason;
	for (i = 0; i < myCards.length; ++i) {
		allowCard (i, false);
		for (j = 0; j < cards.length; ++j) {
			if (myCards[i] == cards[j]) {
				allowCard(i, true);
				break;
			}
		}
	}
}

function allowCard (i, is_allowed) 
{
	selectMask[i] = is_allowed;
	var idx=i*4;
	var cd=document.getElementById('card'+idx);
	cd.classList.toggle ('player_input', is_allowed);
}

//=========================================
// Move the card up to show selected status
//=========================================
function toggleCardSelection (i) 
{
	var location=getCardLocation (i);
	if (location.p == 0 ) {
		var c=document.getElementById('scene'+i);
	    var cy=parseFloat(c.style.top, 10);
	    var idx=Math.floor(i/4);
	    if (cy >= location.y - 0.1) {
	    	c.style.top=cy - 2 + 'vh';
	    	selectedCards[idx]=1;
	    }
	    else {
	    	c.style.top=location.y + 'vh';
	    	selectedCards[idx]=0;
	    }
	}
}
//=========================================
// Display player name and input pending
//=========================================
function setPlayer (p, name)
{
	var view=document.getElementById("player"+p);
	view.innerHTML=name;
	myPlayers[p%4]=name;
}

function flashPlayer (p, on)
{
	var player=document.getElementById("player"+p);
	player.classList.toggle("player_input", on);
	player.style.cursor = ((on && p == 0) ? "pointer" : "");
}

// *******************************************************************************
// Server Event Handling
// HTTP based XML response assumed.
// JASON and other POJO protocols can be easily adapted to
// *******************************************************************************
var session = {player: "", code: "",};
var serverState="Disconnected";
var eventQueue=[];

function serverDebug (s) {
	prompt ("<code>" + s + "</code>");
}

function mainLoop ()
{
	prompt ("Server State:" + serverState);
	if (eventQueue.length > 0 ) {
		handleResponseText (eventQueue.shift());
	}
	else {
		serverRequest ("http://www.ialogic.com/cardgame" +
			 "?CardEvent=CardEventPlayerUpdate" + "&player="+ session.player+ "&code=" +
				 session.code);
	}
}

function login (player, code) {
	if (player != "" && code != "") {
		disableLogin ()
		serverRequest ("http://www.ialogic.com/cardgame" + 
			"?CardEvent=CardEventPlayerRegister" +
			"&player="+ player+
			"&code=" + code);
		session.player=player;
		session.code=code;
		setServerState ("LoginWait");
		var timeout = setInterval(checkLogin, 2000);
		function checkLogin () {
			if (serverState == "LoginWait") {
				prompt ("Please wait..");
				setServerState ("Disconnected");
			}
			else if (serverState == "Disconnected") {
				prompt ("Timeout,  try again...");
				dismissPrompt ();
				clearInterval (timeout);
				enableLogin ()
			}
		}
		return "Waiting for server response";
	}
	else if (code.toUpperCase() == "TEST") {
		testThread = setInterval(testLoop, testThreadInterval);
		session.player=testUsers[0];
		session.code=code;
		return "Waiting for test cases...";
	}
	return "Player/Code Required";
}

function setServerState (s) {
	serverState = s;
	prompt("Server State:" + s);
	if (serverState == "ResponseReceived") {
		idleCount = 0;
	}
}

function serverRequest (theUrl)
{
	if (testThread == null) {
	    var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
	        if (this.readyState == 4 && this.status == 200) {
	        	eventQueue.push (xhttp.responseText);
	        }
	        else if (this.status != 200 && this.status != 0) {
	           	prompt ("Server Error! Status=" + this.status);
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
	switch (gameState) {
	case "Idle":
		break;
	case "Login":
		if (event == "CardEventLoginAck") {
			break;
		}
	case "CleanupEnd":
		if (event == "CardEventDealCards") {
			myRound = 0;
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
			++myRound;
			break;
		}
	default:
		eventQueue.unshift(text);
		prompt ("State: " + gameState + " is not Ready for:" + event);
		return;
	}
	//=============================================================
	//	END State Transition:
	//=============================================================
	setServerState ("ResponseReceived");
	prompt ("Game State:" + gameState + " Message:" + message );
	
	switch (event) {
	case "CardEventLoginAck":
		var status = response.getElementsByTagName("status")[0].childNodes[0].nodeValue;
		if (status == "OK") {
			myPosition = parseInt(player.getAttribute("position"));
			startGame ();
		}
		else {
			prompt (message);
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
		break;
	case "CardEventFaceUpResponse":
		var cards = response.getElementsByTagName("faceup")[0].childNodes[0].nodeValue;
		showFaceup (position, cards);
		break;
	case "CardEventTurnToPlay":
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
		playerReady (myRound, position, reason, allowed);
		break;
	case "CardEventPlayerAction":
		var card = response.getElementsByTagName("cardPlayed")[0].getAttribute("card");
		playCard (position, myRound, card);
		break;
	case "CardEventPlayerAutoAction":
		autoPlayCard ();
		break;
	case "CardEventEndRound":
		var points = response.getElementsByTagName("player")[0].getAttribute("points");
		discardCards (position, points);
		gameState = "PlayerReady";
		break;
	default:
		prompt ("Event Name:" + event + ", Message:" + Message);
	}
} 
//*******************************************************************************
// Test Code Functions:
// This is client side only test code to validate 
// 1. XML parsing
// 2. Animation effects
// 3. Event handlers.
// It does not try to validate state transition from server side. 
//*******************************************************************************
var testThread=null;
var testThreadInterval = 1000;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];
var testState = "Test_Login";
var testStage = 0;
var testHand="3C,4C,5C,8C,7D,AD,5H,XH,JH,QH,KH,5S,9S";
var testFaceups = ["XC,QS", 'AH',"JD"];
var testGame = [
	[2, '6D,XD,AD,2D', 0, ''],
	[0, 'XH,6H,2H,7H', 0, '2H,6H,7H,XH'],
	[0, '5H,4S,4H,9H', 3, '4H,5H,9H'],
	[3, '2C,8C,9C,QC', 2, ''],
	[2, '3H,4D,KH,8S', 0, '3H,KH'],
	[0, 'QH,XC,AH,6S', 2, 'XC,QH,AH'],
	[2, '8H,7C,JH,QD', 0, '8H,JH'],
	[0, '4C,6C,3D,AC', 3, ''],
	[3, '2S,9S,XS,AS', 2, ''],
	[2, '9D,KD,7D,7S', 3, ''],
	[3, '8D,3C,KC,5D', 3, ''],
	[3, 'KS,5S,QS,3S', 3, 'QS'],
	[3, 'JD,5C,JC,JS', 3, 'JD'],
];

function testLoop () 
{
	var testResponse=
		"<event name='CardEventGameIdle'>" +
		"<message>testState: " + testState + ", stage:" + testStage + "</message>" +
		"</event>";
	
	switch (testState) {
	case "Test_Login":
		testResponse=
			"<event name='CardEventLoginAck'>" +
			"<message>Welcome</message>" +
			"<player name='" + testUsers[0] + "' position='2'/>" +
			"<status>OK</status>" +
			"</event>";
		testState = "Test_Idle";
		break;
	case "Test_Idle":
		++testStage;
		if (testStage == 1) {
			testResponse=
				"<event name='CardEventGameIdle'>" +
				"<message>Waiting for Players</message>" +
				"</event>";
		}
		else if (testStage < 5) {
			var i = testStage - 1;
			testResponse=
				"<event name='CardEventPlayerRegister'>" +
				"<message>New Player: " + testUsers[testStage-1] + "</message>";
			testResponse = testResponse + 
				"<player name='" + testUsers[i] + "' position='" + ((i+2)%4) + "' />"; 
			testResponse = testResponse + "</event>";
		}
		else {
			testResponse=
				"<event name='CardEventShuffleEffect'>" +
				"<message>Shuffling Cards</message>";
				testResponse = testResponse + "</event>";
			testState = "Test_DealCard";
		}
		break;
	case "Test_DealCard":
		testResponse=
			"<event name='CardEventDealCards'>" +
			"<message>Dealing Cards</message>" +
				"<player name='Steve'>" +
				"<hand>" + testHand + "</hand>" +
				"</player>";
			testResponse = testResponse + "</event>";
			testState = "Test_Negotiate";
			break;
	case "Test_Negotiate":
		testResponse=
			"<event name='CardEventFaceUp'>" +
			"<message>Choose Cards or Pass</message>" + 
			"<rule reason='Special card only' allowed='AH,QS,XC,JD'/>";
			testResponse = testResponse + "</event>";
			testStage = 0;
			testState = "Test_FaceUpResponse";
			break;
	case "Test_FaceUpResponse":
		if (testFaceups.length > 0) {
			var card = testFaceups.shift();
			var p = (testStage + 3 + 2) % 4;
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='" + testUsers[p] + "'>" +
				"<faceup>" + card + "</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
			++testStage;
		}
		else {
			testStage = 0;
			testResponse=
				"<event name='CardEventPlayerAutoAction'>" +
				"<message>Player event</message>" + 
				"<player name='" + testUsers[0] +"'/>";
			testResponse = testResponse + "</event>";
			testState = "Test_EndTurn";
		}
		break;
	case "Test_EndTurn":
		if (testFaceups.length > 0) {
			testState = "Test_FaceUpResponse";
		}
		else {
			testState = "Test_PlayerReady";
		}
		break;
	case "Test_PlayerReady":
		if (testStage > 103) {
			testState="Test_EndHand";
		}
		else {
			var turn = Math.floor (testStage/2);
			var step = turn % 4;
			var r = Math.floor (turn / 4);
			var start = testGame[r][0];
			var p = (turn + start) % 4;
			var card = testGame[r][1].split(",")[step];
			
			if ((testStage % 2) == 0) {
				testResponse=
					"<event name='CardEventTurnToPlay'>" +
					"<message>Player event</message>" + 
					"<player name='" + testUsers[p] + "'>" +
					"</player>" +
					"<rule reason='Test Only' allowed='" + card + "'/>";
				testResponse = testResponse + "</event>";
				if (p == 0) {
					testState = "Test_PlayerTurnResponse";
				}
				++testStage;
			}
			else {
				if (p != 0) {
					testResponse=
						"<event name='CardEventPlayerAction'>" +
						"<message>Player event</message>" + 
						"<player name='" + testUsers[p] +"'>" +
						"<cardPlayed card='" + card + "'/>" +
						"</player>";
					testResponse = testResponse + "</event>";
				}
				if (step == 3) {
					testState = "Test_EndRound";
				}
				++testStage;
			}
		}
		break;
	case "Test_PlayerTurnResponse":
		testResponse=
			"<event name='CardEventPlayerAutoAction'>" +
			"<message>Player event</message>" + 
			"<player name='" + testUsers[0] +"'/>";
		testResponse = testResponse + "</event>";
		testState = "Test_PlayerReady";
		break;
	case "Test_EndRound":
		var turn = Math.floor ((testStage-1)/2);
		var r = Math.floor (turn / 4);
		var p = testGame[r][2];
		var points = testGame[r][3];
		testResponse=
			"<event name='CardEventEndRound'>" +
			"<message>Round Ended</message>" +
			"<player name='" + testUsers[p] +
				"' points='" + points +
				"'>" +
			"</player>";
		testResponse = testResponse + "</event>";
		testState = "Test_PlayerReady";
		break;
	case "Test_EndHand":
		testStage = 0;
		clearInterval(testThread);
		break;
	default:;
	}
	eventQueue.push (testResponse);
}
