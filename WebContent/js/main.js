//===============================================
// Card image and location
//===============================================
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
// UI Control Functions:
// These functions are called by the Browser objects.
// Changing the names requires change in index.html.
// *******************************************************************************
var idleThread;
var pollingInterval = 1000;
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
	prompt ("Game State:" + gameState);
	var c=document.getElementById("score");
	c.style.display="block";
	mainLoop ();
}

function clickPlayer (p)
{
	if (p == 0) {
		var card = -1;
		var cards = "";
		var sep = "";
		for (i = 0; i < playerCards[0].length; ++ i) {
			if (selectedCards[i] != 0) {
				cards += sep + playerCards[0][i];
				sep = ",";
				card = i;
			}
		}
		if ((card < 0 || cards.length > 2) && gameState == "PlayerTurnResponse") {
			// Can't end turn without select single card;
			prompt ("Choose a single card, please");
		}
		else if (gameState == "PlayerTurnResponse" || gameState == "FaceUpResponse") {
			var event = "";
			if (gameState == "PlayerTurnResponse") {
				setPlayerDisplayPlayed (0, cards, true);
				event="CardEventPlayerAction";
			}
			else {
				setPlayerDisplayFaceup (0, cards);
				event="CardEventFaceUpResponse";
			}
			for (i = 0; i < playerCards[0].length; ++ i) {
				selectedCards[i] = 0;
			}
			enableCards ("Turn Over", "");
			flashPlayer (0, false);
			serverRequest (event, cards);
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

function dismiss (c)
{
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

var autoPlayGame = false;
function toggleAutoPlay () {
	switch (gameState) {
	case "Initial":
		document.getElementById("player").value="";
		document.getElementById("code").value="test";
		autoPlayGame=true;
		setTimeout (sendLogin, 0);
		break;
	case "Idle":
	case "Login":
		prompt ("Auto play not available");
		break;
	default:
		autoPlayGame = !autoPlayGame;
	}
	var c=document.getElementById("auto");
	c.classList.toggle ("auto_on", autoPlayGame);
}

function shutdown () {
	if (gameState != "Initial") {
		var splash = document.getElementById("splash");
		splash.style.backgroundImage = "url('image/shutdown.gif')";
		restartClient ("");
	}
	else {
		location.reload();
	}
	
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

function promptServer (text)
{
	var c=document.getElementById("server");
	c.style.display="block";
	c.classList.toggle ("server_connected", text == "Connected");
	c.classList.toggle ("server_offline", text == "Offline");
}

function score (players, lines, faceups)
{
	if (players && players.length > 0) {
		for (i = 0; i < players.length; ++i) {
			var points = players[i].getAttribute("points");
			if (points && points != "") {
				var cards = points.split(",");
				var text = "";
				var hearts = "";
				for (c = 0; c < cards.length; ++c) {
					if (cards[c].substring(1,2) != "H" || cards[c].substring(0,1) == "A") {
						text += "<img class='score_points' src='image/cards/" + cards[c] + ".jpg'>";
					}
					else {
						hearts += cards[c].substring(0,1) + " ";
					}
				}
				text += "<BR>" + hearts;
				document.getElementById("cards_" + i).innerHTML=text;
			}
			else {
				document.getElementById("cards_" + i).innerHTML="&nbsp;";			
			}
		}
	}
	if (lines && lines.length > 2) {
		document.getElementById("score").style.display="block";
		var names = lines[0].childNodes[0].nodeValue.split(",");
		for (i = 0; i < 4; ++i) {
			document.getElementById("name_" + i).innerHTML=names[i];
		}
		var scores = lines[1].childNodes[0].nodeValue.split(",");
		for (i = 0; i < 4; ++i) {
			document.getElementById("score_" + i).innerHTML=scores[i];
		}
		// We only have 10 line display
		var start = lines.length > 17 ? lines.length - 15 : 2;
		for (i = 0; i < lines.length - start; ++i) {
			scores = lines[i + start].childNodes[0].nodeValue.split(",");
			document.getElementById("hand_" + i).innerHTML=scores[0];
			document.getElementById("score_0_" + i).innerHTML=scores[1];
			document.getElementById("score_1_" + i).innerHTML=scores[2];
		}
		document.getElementById("headline").innerHTML="Score Board - Hand " + (lines.length - 2);
		var f = "";
		if (faceups) {
			var cards = faceups[0].childNodes[0].nodeValue.split(",");
			for (i = 0; i < cards.length; ++i) {
				f += "<img class='score_faceups' src='image/cards/" + cards[i] + ".jpg'>";
			}
		}
		document.getElementById("faceups").innerHTML=f+"<BR>x&nbsp;2";
	}
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

//=============================
//Global Settings
//=============================
var gameState = "Initial";
var center={x:0, y:0,};
var myPosition = 0;
var myPlayers = ["","","",""];
var selectMask = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var selectedCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var faceupCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var maskReason = "Not your turn yet";

var discarded=[];
var playerCards=[[],[],[],[]];
var playerPoints=[[],[],[],[]];
//===============================================
//===============================================
function dealCards(hand)
{
    var id = setInterval (work, 100);
    function work () {
		// Wait for animation finishes
	  if (gameState == "CleanupEnd") {
			playerCards=[[],[],[],[]];
			playerCards[0] = hand.split(",");

			for (i = 1; i < 4; ++i) {
				for (j = 0; j < 13; ++j) {
					playerCards[i].push ("NA");
				}
			}
			clearInterval (id);
			gameState = "DealCards";
			dealCard (0, playerCards[0]);
			for (i = 0; i < selectMask.length; ++i) {
				selectMask[i]=0;
				selectedCards[i]=0;
				faceupCards[i]=0;
			}
			discarded=[];
			playerPoints=[[],[],[],[]];
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
	  else {
		  rotateCard(i, ((l.p % 2) == 1));
	  }
	  raiseCard (i, 99)
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
			if (p != 0) {
				setPlayerDisplayFaceup (p, c);
			}
    	}
    }
}

function playerReady (position, reason, allowed)
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
						prompt ("Unexpected rule exception");
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
   		  	if (gameState == "FaceUpResponse") {
   		  		autoPlayerFaceup ();
   		  	}
   		  	else {
   		  		autoPlayerTurn ();
   		  	}
			clickPlayer (0);
			gameState = "PlayerReady";
    	}
    }
}

function autoPlayerTurn () {
	var n = 0;
	for (i = 0; i < selectMask.length; ++i) {
		n += selectMask[i];
	}
	n = Math.floor (Math.random () * n);
	for (i = 0; i < selectMask.length; ++i) {
		n -= selectMask[i];
		if (n < 0) {
			break;
		}
	}
	toggleCardSelection (i*4);
}

function autoPlayerFaceup () {
	for (i = 0; i < selectMask.length; ++i) {
		if (selectMask[i] == 1) {
			var card = playerCards[0][i];
			var suit = card.substring(1,2);
			var n = 0;
			for (j = 0; j < playerCards[0].length; ++j) {
				if (playerCards[0][j].substring(1,2) == suit) {
					++n;
				}
			}
			if (n > 3) {
				toggleCardSelection (i*4);
			}
		}
	}
}

function playCard (position, card) {
    var id = setInterval (work, 100);
    function work () {
    	if (gameState == "PlayerReady") {
   		  	clearInterval (id);
			flashPlayer (position, false);
   		  	setPlayerDisplayPlayed (position, card, true);
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
		lowerCard (i);
		for (j = 0; !found && j < cards.length; ++j) {
			found = (card == cards[j]);
		}
		if (found) {
			setPlayerDisplayPoints(p, card, i);
		}
		else {
			rotateCard (i, true);
			moveCardEffect (i,  center.x, center.y);
		}
	}
}

function setPlayerDisplayCards (p, cards) {
	for (i = 0; i < cards.length; ++i) {
		var idx = i*4 + p;
		var l=getCardLocation (idx);		
		var c=document.getElementById('scene'+idx);
		raiseCard (idx, 99);
		if (cards[i] != "XX") {
			c.style.left = l.x + "vw";
			c.style.top = l.y + "vh";
			if (p == 0) {
				setCardFace (idx, playerCards[0][i]);
				flipCard(idx);
			}
			else  {
				  rotateCard(idx, ((p % 2) == 1));			
			}
		} 
		else {
			c.style.left = center.x + "vw";
			c.style.top = center.y + "vh";
			rotateCard(idx, true);
		}
	}
}

function setPlayerDisplayFaceup (p, c) {
	if (c != ""  && c != "NA") {
		var cards=c.split(",");
		var count = cards.length;
		for (i = 0; i < cards.length; ++i) {
			var idx = p - i*4 + 48;
			if (p == 0) {
				for (j =0; j < playerCards[0].length; ++j) {
					if (playerCards[0][j] == cards[i]) {
						idx = j * 4;
						break;
					}
				}
			}
			var pos = getCardLocation (idx);
			setCardFace (idx, cards[i]);
			switch (p) {
				case 0: pos.y -= 4; break;
				case 1: pos.x -= 4; break;
				case 2: pos.y += 4; break;
				case 3: pos.x += 4; break;
			}
			if (p != 0) {
				flipCard (idx);
				playerCards[p][12-i] = cards[i];
			} 
			moveCardEffect (idx, pos.x, pos.y)
		}
	}
}

function setPlayerDisplayPlayed (p, played, normal) {
	if (played != "NA") {
		var l = getPlayerLocation (p);
		cards = playerCards[p];
		var i = 0;
		if (normal) {
			// Normal play from hand
			for (i = cards.length - 1; i >=0;  --i) {
				if (cards[i] == "NA" || cards[i] == played) {
					idx = i * 4 + p;
					playerCards[p][i] = "XX";
					break;
				}
			}
		}
		else {
			// Recovery from discarded
			for (i = 0; i < cards.length; ++i) {
				if (cards[i] == "XX") {
					idx = i * 4 + p;
					playerCards[p][i] = "XK";
					break;
				}
			}
		}
		faceUpCard (idx);
		rotateCard(idx, ((p % 2) == 1));			
		setCardFace (idx, played);
		moveCardEffect (idx, l.x+1, l.y+2.5);
		discarded.push(idx);
	}
}

function setPlayerDisplayPoints (p, points, discard) {
	if (points != "") {
		var cards = points.split(",");
		for (i = 0; i < cards.length; ++i) {
			if (discard < 0) {
				// Recovery from discarded
				for (idx = 0; idx < 52; ++idx) {
					var pp = idx % 4;
					var pc = Math.floor(idx / 4);
					if (playerCards[pp][pc] == "XX") {
						playerCards[pp][pc] = "XK";
						break;
					}
				}
			}
			else {
				idx = discard;
			}
			playerPoints[p].push (idx);
			setCardFace (idx, cards[i]);
			faceUpCard (idx);
			rotateCard(idx, (p%2==1));
			var d = ((playerPoints[p].length - 1) % 13) * 4 + p;
			var m = (playerPoints[p].length < 14 ? 1 : 2);
			var dx = (p == 0 || p == 2) ? (p == 0 ? -2 : 0)  : ((p == 1) ? 2 : -2);
			var dy = (p == 1 || p == 3) ? 0 : ((p == 0) ? 6 : -5);
			var l = getCardLocation (d);
			raiseCard (idx, 100 + d);
			moveCardEffect (idx,  l.x + dx * m, l.y + dy * m);
		} 
	}
}

function setPlayerDisplay (players) {
    var id = setInterval (work, 100);
    function work () {
	// Wait for animation finishes
	  if (gameState == "CleanupEnd") {
	  		clearInterval (id);
	  		for (k = 0; k < players.length; ++k) {
				var player = players[k];
				var p = (parseInt(player.getAttribute("position")) - myPosition + 4) % 4;
				var cards = player.getElementsByTagName("hand")[0].childNodes[0].nodeValue.split(",");				
				// Fill discarded cards
				for (i = cards.length; i < 13; ++i) {
					cards.unshift ("XX");
				}
				playerCards[p] = cards;
				setPlayer (p, player.getAttribute("name"));
				setPlayerDisplayCards (p, cards);
				var faceup = player.getElementsByTagName("faceup")[0].childNodes[0];
				var c = faceup ? faceup.nodeValue : "NA";
				setPlayerDisplayFaceup (p, c);
				var played = player.getElementsByTagName("cardPlayed")[0].getAttribute("card");
				setPlayerDisplayPlayed (p, played, false);
	  		}
	  		// We don't know where the points are from, so we need to do it after showing the played cards
	  		for (k = 0; k < players.length; ++k) {
				var player = players[k];
				var p = (parseInt(player.getAttribute("position")) - myPosition + 4) % 4;
				var points = player.getAttribute("points");
				setPlayerDisplayPoints (p, points, -1);
	  		}
			gameState = "PlayerReady";
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

function rotateCard(i, is_rotated)
{
	var c = document.getElementById('scene'+i);
	c.classList.toggle ('rotated', is_rotated);
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
	for (i = 0; i < playerCards[0].length; ++i) {
		allowCard (i, false);
		for (j = 0; j < cards.length; ++j) {
			if (playerCards[0][i] == cards[j]) {
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
	    if (selectMask[idx] == 1) {
		    selectedCards[idx] = 1-selectedCards[idx];
	    	var dy = selectedCards[idx] == 1 ? -2 : 2;
		    if (faceupCards[i] == 1) {
		    	dy = selectedCards[idx] == 1 ? -2 : 4;
		    }
	    	c.style.top= (cy + dy) + 'vh';
	    }
	    else {
	    	alert ("Assertion failed: Invalid selection:" + idx);
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
var serverState="Offline";
var eventQueue=[];

function serverDebug (s) {
	prompt ("<code>" + s + "</code>");
}

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
		testThread = setInterval(testLoop, testThreadInterval);
		session.player=testUsers[0];
		session.code=code;
		return "Waiting for test cases...";
	}
	return "Player/Code Required";
}

var idleCount=0;
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
var testHand="3C,4C,5C,8C,7D,AD,5H,XH,JH,QH,AH,5S,9S";
var testFaceups = ["XC,QS", '',"JD"];
var testGame = [
	[2, '6D,XD,AD,2D', 0, ''],
	[0, 'XH,6H,2H,7H', 0, '2H,6H,7H,XH'],
	[0, '5H,4S,4H,9H', 3, '4H,5H,9H'],
	[3, '2C,8C,9C,QC', 2, ''],
	[2, '3H,4D,AH,8S', 0, '3H,AH'],
	[0, 'QH,XC,KH,6S', 2, 'XC,QH,KH'],
	[2, '8H,7C,JH,QD', 0, '8H,JH'],
	[0, '4C,6C,3D,AC', 3, ''],
	[3, '2S,9S,XS,AS', 2, ''],
	[2, '9D,KD,7D,7S', 3, ''],
	[3, '8D,3C,KC,5D', 3, ''],
	[3, 'KS,5S,QS,3S', 3, 'QS'],
	[3, 'JD,5C,JC,JS', 3, 'JD'],
];
var testScore = [
	"Steve,Ying,Chris,Tiff",
	"180,0,-1120,0",
	"1,-480,-160",
	"2,-840,-380",
	"3,-1780,-380"
]

var testPoints = [
	"2H,3H,9H,XH,JD,4H",
	"",
	"QS,KH,8H,XC,AH,5H,6H,7H,QH,JH",
	""
]

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
		testState = "Test_Reconnect";
		break;
	case "Test_Reconnect":
		if (testStage == 0) {
			testResponse = 
				"<event name='CardEventPlayerReconnect'><message>Welcome back!</message>" +
					"<player name='" + testUsers[0] + "' position='2' points='4H'><hand>XC,4D,5D,6D,7D,5H,XH,QS,4S</hand><faceup>XC</faceup><cardPlayed card='NA'/></player>" +
					"<player name='" + testUsers[1] + "' position='3' points='9H'><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup>JD</faceup><cardPlayed card='4C'/></player>" + 
					"<player name='" + testUsers[2] + "' position='0' points='3H,5H'><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup>AH</faceup><cardPlayed card='2C'/></player>" +
					"<player name='" + testUsers[3] + "' position='1' points=''><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup></faceup><cardPlayed card='3C'/></player>";
			testResponse = testResponse + "</event>";
		}
		else if (testStage > 3) {
			testState = "Test_EndHand";
		}
		++testStage;
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
					"<message>" + testUsers[p] + "'s turn to play</message>" + 
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
						"<message>" + testUsers[p] + " played card</message>" + 
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
		testResponse=
			"<event name='CardEventScoreBoard'>" +
			"<message>Score for Test Hand</message>\n";
			for (i = 0; i < testPoints.length; ++i) {
				testResponse += "<player name='" + testUsers[i] + 
					"' points='" + testPoints[i] + "' />\n";
			}
			for (i = 0; i < testScore.length; ++i) {
				testResponse += "<line>" + testScore[i] + "</line>\n";
			}
			testResponse += "<faceup>";
			var sep = ""
			for (i = 0; i < testFaceups.length; ++i) {
				if (testFaceups[i] != "") {
					testResponse += sep + testFaceups[i];
					sep = ",";
				}
			}
			testResponse += "</faceup>";
		testResponse = testResponse + "</event>";
		testState = "Test_End";
		break;
	case "Test_End":
		prompt ("Restarting hand");
		testStage = 5;
		testState = "Test_Idle";
		break;
	default:;
	}
	eventQueue.push (testResponse);
}
