var myPosition = 0;
var myPlayers = ["","","",""];
var selectMask = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var selectedCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var faceupCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var maskReason = "Not your turn yet";

var discarded=[];
var playerCards=[[],[],[],[]];
var playerPoints=[[],[],[],[]];
//*******************************************************************************
//Game Play Functions:
//These are the functions that describes the game play
//for the event handlers and UI's
//Low level animation effect details should be hidden from the interface
//so it can be enhanced in the future. 
//*******************************************************************************
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

function enableAI (display) {
	var ai = document.getElementById("selectAI");
	if (display) {
		setTimeout (function () {
			for (i = 0; i < 4; ++i) {
				if (myPlayers[i] == "") {
						ai.style.display = "flex";
						ai.classList.toggle("fade-in", true);
					break;
				}
			}
		}, 2000);
	}
	else {
		ai.style.display = "none";
	}
}

function requestAI ()
{
	for (i = 0; i < 4; ++i) {
		if (myPlayers[i] == "") {
			serverRegsiterAI ("AI_" + i);
			break;
		}
	}
}

function cleanup ()
{
  var id = setInterval (work, 100);
  var ai = document.getElementById("selectAI");
  ai.style.display="none";
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

function faceupReady (reason, allowed) 
{
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
			setPlayerDisplayFaceup (p, c);
  	}
  }
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

function toggleCardSelection (i) 
{
	var l=getCardLocation (i);
	if (l.p == 0 ) {
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


function playerReady (position, rule)
{
  var id = setInterval (work, 100);
  function work () {
  	if (gameState == "PlayerReady") {
 		  	clearInterval (id);
			for (i = 0; i < 4; ++i) {
				flashPlayer (i, i==position);
				if (rule) {
					if (position == 0) {
						if (rule.allowed != "") {
							enableCards (rule.reason, rule.allowed);
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

function score (players, lines, faceups)
{
	if (players && players.length > 0) {
		for (i = 0; i < players.length; ++i) {
			var points = players[i].points;
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
		var names = lines[0].split(",");
		for (i = 0; i < 4; ++i) {
			document.getElementById("name_" + i).innerHTML=names[i];
		}
		var scores = lines[1].split(",");
		for (i = 0; i < 4; ++i) {
			document.getElementById("score_" + i).innerHTML=scores[i];
		}
		// We only have 10 line display
		var start = lines.length > 17 ? lines.length - 15 : 2;
		for (i = 0; i < lines.length - start; ++i) {
			scores = lines[i + start].split(",");
			document.getElementById("hand_" + i).innerHTML=scores[0];
			document.getElementById("score_0_" + i).innerHTML=scores[1];
			document.getElementById("score_1_" + i).innerHTML=scores[2];
		}
		document.getElementById("headline").innerHTML="Score Board - Hand " + (lines.length - 2);
		var f = "";
		if (faceups) {
			var cards = faceups.split(",");
			for (i = 0; i < cards.length; ++i) {
				f += "<img class='score_faceups' src='image/cards/" + cards[i] + ".jpg'>";
			}
		}
		document.getElementById("faceups").innerHTML=f+"<BR>x&nbsp;2";
	}
}

//============================================================================
// Display functions for reconnect event and 
// event handlers to render the game state
//============================================================================
function setPlayerDisplay (players)
{
	  var id = setInterval (work, 100);
	  function work () {
	// Wait for animation finishes
		  if (gameState == "CleanupEnd") {
	  		clearInterval (id);
	  		for (k = 0; k < players.length; ++k) {
				var player = players[k];
				var p = (player.position - myPosition + 4) % 4;
				var cards = player.hand.split(",");				
				// Fill discarded cards
				for (i = cards.length; i < 13; ++i) {
					cards.unshift ("XX");
				}
				playerCards[p] = cards;
				setPlayer (p, player.name);
				setPlayerDisplayCards (p, cards);
				var c = player.faceup;
				setPlayerDisplayFaceup (p, c);
				var played = player.card;
				setPlayerDisplayPlayed (p, played, false);
	  		}
	  		// We don't know where the points are from, so we need to do it after showing the played cards
	  		for (k = 0; k < players.length; ++k) {
				var player = players[k];
				var p = (player.position - myPosition + 4) % 4;
				var points = player.points;
				setPlayerDisplayPoints (p, points, -1);
	  		}
			gameState = "PlayerReady";
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
				raiseCard (idx, 80+i);
			} 
			moveCardEffect (idx, pos.x, pos.y)
		}
	}
}

function setPlayerDisplayPlayed (p, played, normal) {
	if (played && played != "" && played != "NA") {
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
			raiseCard (idx, 100+playerPoints[p].length);
			l = getPointCardLocation (idx, p);
			moveCardEffect (idx, l.x, l.y);
		} 
	}
}

