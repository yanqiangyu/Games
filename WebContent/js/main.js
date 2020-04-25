var idleThread;
var gameState = "Initial";
var session = {player: "", code: "",};
var pollingInterval = 3000;
var myCards;
var selectMask = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var selectedCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var maskReason = "Not your turn yet";
var center={x:0, y:0,};
var discarded=[];

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
function sendLogin()
{
	var player=document.getElementById("player").value;
	var code=document.getElementById("code").value;
	gameState = "Login";
	prompt (login (player, code));
}

function clickLogo () {
	if (gameState == "Idle") {
		gameState = "CleanUp";
	}
	else if (gameState == "Ready") {
		gameState = "Idle";
		randomMove ();
	}
	else  {
		location.reload();
	}
}

function clickPlayer (p)
{
	if (p == 0) {
		var s = "";
		var sep = "";
		var card = -1;
		for (i = 0; i < myCards.length; ++ i) {
			if (selectedCards[i] != 0) {
				s += sep + myCards[i];
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
		else {
			if (gameState == "PlayerTurnResponse") {
				playCard (0, card, myCards[card]);
			}
			for (i = 0; i < myCards.length; ++ i) {
				selectedCards[i] = 0;
			}
			enableCards ("Turn Over", "");
			flashPlayer (0, false);
			gameState="EndTurn";
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
	var idle = 3;
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
	idleThread = setInterval(mainLoop, pollingInterval); 
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
	var ch=Math.floor(viewheight / 8);
	var cw=Math.floor(ch*0.7);
	center.x = (viewwidth-cw) / 2 - 1;
	center.y = (viewheight-ch) / 2;
	
	for (i=0; i<52; ++i) {
		var scene=document.createElement('div');
		scene.setAttribute('id', 'scene'+i);
		scene.classList.add('card_scene', 'card_scene--card');
		table.appendChild(scene);
		scene.style.width="50px";
		scene.style.height="70px";
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
		
		carddeck[i].x = (viewwidth-cw) / 2 - 1;
		carddeck[i].y = (viewheight-ch) / 2;
		scene.style.left = carddeck[i].x + "vw";
		scene.style.top = carddeck[i].y + "vh";
		
		var logo=document.getElementById("logo");
		logo.setAttribute('onClick', 'clickLogo()');
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
	for (i=0; i<52; ++i) {
		carddeck[i].x = center.x;
		carddeck[i].y = center.y;
		cleanCard (i)
		moveCardEffect (i, carddeck[i].x, carddeck[i].y);
	}
}

function dealCards(hand)
{
  var speed=10;
  var i = 0;
  var c = document.getElementById("scene" + i);   
  var step = speed;
  var location=getCardLocation (i);
  var x=location.x;
  var y=location.y;
  var p=location.p;

  myCards = hand.split(",");
  var id = setInterval(frame, 5);

  gameState = "DealCards";
  function frame() {
	if (i == 52) {
      clearInterval(id);
      nextEffect ();
	}
	else {
		if (step <= 0) {
	      c.style.left=x+'vw'; 
	      c.style.top=y+'vh';
	      if (p == 0) {
	    	  var m = Math.floor(i/4);
	    	  setCardFace (i, myCards[m]);
	    	  flipCard(i);
	      }
	      ++i;
	      c = document.getElementById("scene" + i);   
	      location=getCardLocation (i);
	      x=location.x;
	      y=location.y;
	      p=location.p;
	      step = speed;
	    }
		if (step == speed && (p == 1 || p == 3)) {
	    	  rotateCard(i);
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

function showFaceup (p, c)
{
	flashPlayer (p, false);
	if (c != ""  && c != "NA" && p != 0) {
		var cards=c.split(",");
		for (i = 0; i < cards.length; ++i) {
			var idx = p + i*4;
			var pos = getCardLocation (idx);
			setCardFace (idx, cards[i]);
			switch (p){
				case 1: pos.x -= 4; break;
				case 2: pos.y += 4; break;
				case 3: pos.x += 4; break;
			}
			moveCardEffect (idx, pos.x, pos.y);
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
	flashPlayer (position, false);
	var i = round * 4 + position;
	var l = getPlayerLocation (position);
	faceDownCard (i);
	setCardFace (i, card);
	moveCardEffect (i, l.x+1, l.y+2.5);
	discarded.push(i);
}

function discardCards (p) {
	var l = getPlayerLocation (p);
	while (discarded.length > 0) {
		i = discarded.shift();
		faceUpCard (i);
		lowerCard (i)
		moveCardEffect (i,  l.x+1, l.y+2.5);
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
	  y = 75;
  }
  else if (player == 1) {
	  x = 75;
	  y = 64 - n*4;
  }
  else if (player == 2) {
	  x = 69 - n*4;
	  y = 5;
  }
  else if (player == 3) {
	  x = 10;
	  y = n*4 + 16;
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
function moveCardEffect (i, x, y) 
{
  var c = document.getElementById("scene" + i);   
  var step = 50;
  var id = setInterval(frame, 25);
  
  function frame() {
    if (step <= 0) {
      c.style.left=x+'vw'; 
      c.style.top=y+'vh';  
      clearInterval(id);
	  if (i == 51) {
		  nextEffect ();
	  }
    } else {
      if (step == 45) {
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

function nextEffect ()
{
	switch (gameState) {
		case "Login":
		case "Idle":
			randomMove ();
			break;
		case "CleanUp":
			cleanup ();
			gameState = "CleaningUp";
			break;
		case "CleaningUp":
			gameState = "Ready";
			break;
		case "DealCards":
			gameState = "Negotiate";
			break;
		default:;
	}
}
//=========================================================
// Random effects to show when waiting  
//=========================================================
function randomMove ()
{
	for (i=0; i<52; ++i) {
		var x = carddeck[i].x + (Math.random() - 0.5) * 30;
		var y = carddeck[i].y + (Math.random() - 0.5) * 30;
		
		if (x > 90) x = 180 - x;
		if (y > 90) y = 180 - y;
		if (x < 10) x = 10 - x;
		if (y < 10) y = 10 - y;
		carddeck[i].x = x;
		carddeck[i].y = y;
		moveCardEffect (i, carddeck[i].x, carddeck[i].y);
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
	var c = document.getElementById('scene'+i);
	c.style.zIndex = 50; 
}

function rotateCard(i)
{
	var c = document.getElementById('scene'+i);
	c.classList.add('rotated');
}

function cleanCard (i) {
	var c = document.getElementById('card'+i);
	c.classList.toggle ('is-flipped', false);
	var s = document.getElementById('scene'+i);
	s.classList.toggle ('rotated', false);
}

function setCardFace (i, face) {
	var cf=document.getElementById('cardface'+i);
	cf.style.backgroundImage="url('image/cards/" + face + ".jpg')";
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
function mainLoop ()
{
	/*
	 * serverRequest ("http://www.ialogic.com/cardgame" +
	 * "?CardEvent=CardEventGameIdle" + "&player="+ session.player+ "&code=" +
	 * session.code);
	 */
}

function login (player, code) {
	if (player != "" && code != "") {
		serverRequest ("http://www.ialogic.com/cardgame" + 
			"?CardEvent=CardEventPlayerRegister" +
			"&player="+ player+
			"&code=" + code);
		session.player=player;
		session.code=code;
		return "Wait for response...";
	}
	else if (code.toUpperCase() == "TEST") {
		testThread = setInterval(testLoop, testThreadInterval);
		session.player=testUsers[0];
		session.code=code;
		return "Waiting for test cases...";
	}
	return "Playe/Code Required";
}

function serverRequest (theUrl)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        	handleResponseText (xhttp.responseText);
        }
        else {
           	handleResponseText ("Server not available");
        }
    };
    xhttp.open("GET", theUrl, true); 
    xhttp.send(null);
}

function handleResponseText (text)
{
	var response = new DOMParser().parseFromString(text,"text/xml");
	var event=response.getElementsByTagName("event")[0].getAttribute("name");
	var message = response.getElementsByTagName("message")[0].childNodes[0].nodeValue;
	prompt ("Game State:" + gameState + " Message:" + message );
	switch (event) {
	case "CardEventGameIdle":
		switch (gameState) {
		case "Login":
			if (message == "OK") {
				startGame ();
			}
			break;
		default:
			prompt (message);
			break;
		}
		// update game board
		break;
	case "CardEventPlayerRegister":
		var players = response.getElementsByTagName("player");
		if (players) {
			for (i = 0; i < players.length; ++i) {
				setPlayer (players[i].getAttribute("position"),
					players[i].getAttribute("name"));
			}
		}
		prompt (message);
		break;
	case "CardEventShuffleEffect":
		prompt (message);
		gameState = "CleanUp";
		break;
	case "CardEventDealCards":
		var hand = response.getElementsByTagName("hand")[0].childNodes[0].nodeValue;
		dealCards (hand);
		break;
	case "CardEventFaceUp":
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
		prompt (message);
		enableCards (reason, allowed);
		for (i = 0; i < 4; ++i) {
			flashPlayer(i, true);
		}
		gameState = "FaceUpResponse";
		break;
	case "CardEventFaceUpResponse":
		var position = parseInt(response.getElementsByTagName("player")[0].getAttribute("position"));
		var cards = response.getElementsByTagName("faceup")[0].childNodes[0].nodeValue;
		showFaceup (position, cards);
		break;
	case "CardEventTurnToPlay":
		var player = response.getElementsByTagName("player")[0];
		var position = parseInt(player.getAttribute("position"));
		var r = parseInt(player.getAttribute("round"));
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
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
			}
		}
		break;
	case "CardEventPlayerAction":
		var position = parseInt(response.getElementsByTagName("player")[0].getAttribute("position"));
		var round = parseInt(response.getElementsByTagName("cardPlayed")[0].getAttribute("round"));
		var card = response.getElementsByTagName("cardPlayed")[0].getAttribute("card");
		playCard (position, round, card);
		break;
	case "CardEventEndRound":
		var position = parseInt(response.getElementsByTagName("player")[0].getAttribute("position"));
		var points = response.getElementsByTagName("player")[0].getAttribute("position");
		discardCards (position);
		gameState="PlayerReady";
		break;
	default:
		prompt ("Event Name:" + event);
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
var testThread;
var testThreadInterval = 500;
var testStage = 0;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];
var testHand="8S,JS,3H,5C,4D,8D,XS,2D,KD,KC,9C,JD,6C";
var testFaceups = ["NA", 'AH',"NA"];
var testGame = [
	[0, 'KD,XD,AD,3D', 2, ''],
	[2, '6S,AS,JS,9S', 3, ''],
	[3, 'QH,3H,KH,AH', 2, '3H,QH,KH,AH'],
	[2, '3C,XC,5C,JC', 1, 'XC'],
	[1, '9D,5D,6D,JD', 0, 'JD'],
	[0, '6C,8C,4C,2C', 1, ''],
	[1, 'JH,8H,2H,2D', 1, '2H,8H,JH'],
	[1, 'QC,6H,7C,KC', 0, '6H'],
	[0, '4D,7D,7S,5H', 1, '5H'],
	[1, 'XH,9H,4H,8D', 1, '4H,9H,XH'],
	[1, '4S,QS,5S,8S', 2, 'QS'],
	[2, 'KS,3S,XS,AC', 2, ''],
	[2, '7H,2S,9C,QD', 2, '7H'],
];

function testLoop () 
{
	var testResponse=
		"<event name='CardEventGameIdle'>" +
		"<message>Game State:" + gameState + ", stage:" + testStage + "</message>" +
		"</event>";
	
	switch (gameState) {
	case "Login":
		testResponse=
			"<event name='CardEventGameIdle'>" +
			"<message>OK</message>" +
			"</event>";
		break;
	case "Idle":
		++testStage;
		if (testStage == 1) {
			testResponse=
				"<event name='CardEventGameIdle'>" +
				"<message>Waiting for Players</message>" +
				"</event>";
		}
		else if (testStage < 5) {
			testResponse=
				"<event name='CardEventPlayerRegister'>" +
				"<message>New Player: " + testUsers[testStage-1] + "</message>";
				for (i = 0; i < testStage; ++i) {
					testResponse = testResponse + 
						"<player name='" + testUsers[i] + "' position='" + i + "' >" + 
						"</player>";
				}
				testResponse = testResponse + "</event>";
		}
		else {
			testResponse=
				"<event name='CardEventShuffleEffect'>" +
				"<message>Shuffling Cards</message>";
				testResponse = testResponse + "</event>";
		}
		break;
	case "Ready":
		testResponse=
			"<event name='CardEventDealCards'>" +
			"<message>Dealing Cards</message>" +
				"<player name='Steve' position='0'>" +
				"<hand>" + testHand + "</hand>" +
				"</player>";
			testResponse = testResponse + "</event>";
			break;
	case "Negotiate":
		testResponse=
			"<event name='CardEventFaceUp'>" +
			"<message>Choose Cards or Pass</message>" + 
			"<rule reason='Special card only' allowed='AH,QS,XC,JD'/>";
			testResponse = testResponse + "</event>";
			testStage = 0;
			break;
	case "FaceUpResponse":
		if (testFaceups.length > 0) {
			var card = testFaceups.shift();
			var p = (testStage + 1) % 4;
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='" + testUsers[p] + "' position='" + p + "'>" +
				"<faceup>" + card + "</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
			++testStage;
		}
		else {
			testStage = 0;
			clickPlayer(0);
		}
		break;
	case "EndTurn":
		gameState = (testFaceups.length > 0) ?
			"FaceUpResponse" : "PlayerReady";
		break;
	case "PlayerReady":
		if (testStage > 103) {
			gameState="EndHand";
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
					"<player name='" + testUsers[p] +
						"' position='" + p + 
						"' round='" + r +
						"'>" +
					"</player>" +
					"<rule reason='Test Only' allowed='" + card + "'/>";
				testResponse = testResponse + "</event>";
				if (p == 0) {
					gameState = "PlayerTurnResponse";
				}
				++testStage;
			}
			else {
				if (p != 0) {
					testResponse=
						"<event name='CardEventPlayerAction'>" +
						"<message>Player event</message>" + 
						"<player name='" + testUsers[p] +"' position='" + p + "'>" +
						"<cardPlayed card='" + card + "' round='" + r + "'/>" +
						"</player>";
					testResponse = testResponse + "</event>";
				}
				if (step == 3) {
					gameState = "Pause";
				}
				++testStage;
			}
		}
		break;
	case "PlayerTurnResponse":
		// auto play
		for (i = 0; i < selectMask.length; ++i) {
			if (selectMask[i] == 1) {
				if (selectedCards[i] !=1) {
					toggleCardSelection (i*4);
				}
				break;
			}
		}
		clickPlayer(0);
		break;
	case "Pause":
		gameState = "EndRound";
		break;
	case "EndRound":
		var turn = Math.floor ((testStage-1)/2);
		var r = Math.floor (turn / 4);
		var p = testGame[r][2];
		var points = testGame[r][3];
		testResponse=
			"<event name='CardEventEndRound'>" +
			"<message>Round Ended</message>" +
			"<player name='" + testUsers[p] +
				"' position='" + p + 
				"' round='" + r +
				"' points='" + points +
				"'>" +
			"</player>";
		testResponse = testResponse + "</event>";
		break;
	case "EndHand":
		testStage = 0;
		clearInterval(testThread);
		break;
	default:;
	}
	handleResponseText (testResponse);
}
