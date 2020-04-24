var idleThread;
var gameState = "Initial";
var session = {player: "", code: "",};
var pollingInterval = 5000;
var testThreadInterval = 5000;
var testStage = 0;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];
var myCards;
var selectMask = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var selectedCards = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var maskReason = "Not your turn yet";

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

//======================================================================

function sendLogin()
{
	var player=document.getElementById("player").value;
	var code=document.getElementById("code").value;
	gameState = "Login";
	prompt (login (player, code));
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

function setPlayer (p, name)
{
	var view=document.getElementById("player"+p);
	view.innerHTML=name;
}

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


function collectCards (i, x, y) 
{
  var c = document.getElementById("scene" + i);   
  var step = 100;
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
      if (step == 90) {
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


function flipCard(i)
{
	var c = document.getElementById('card'+i);
	c.classList.toggle('is-flipped');
}

function rotateCard(i)
{
	var c = document.getElementById('scene'+i);
	c.classList.add('rotated');
}

function setCardFace (i, face) {
	var cf=document.getElementById('cardface'+i);
	cf.style.backgroundImage="url('image/cards/" + face + ".jpg')";
}


function enableCards (reason, allowed)
{
	var cards=allowed.split(",");
	for (j = 0; j < myCards.length; ++j) {
		allowCard (j, 0);
		for (i = 0; i < cards.length; ++i) {
			if (myCards[j] == cards[i]) {
				allowCard(j, 1);
				break;
			}
		}
	}
	maskReason = reason;
}

function allowCard (i, allowed) 
{
	selectMask[i] = allowed;
	var idx=i*4;
	var cd=document.getElementById('card'+idx);
	if (allowed == 1) {
		cd.classList.toggle ('selectable', true);
	}
	else {
		cd.classList.toggle ('selectable', false);
	}
}

function showFaceup (p, c)
{
	if (c != ""  && p != 0) {
		var cards=c.split(",");
		for (i = 0; i < cards.length; ++i) {
			var idx = p - i*4 + 48;
			var pos = getCardLocation (idx);
			setCardFace (idx, cards[i]);
			switch (p){
				case "1": pos.x = pos.x - 4;break;
				case "2": pos.y = pos.y + 4;break;
				case "3": pos.x = pos.x + 4;break;
			}
			collectCards (idx, pos.x, pos.y);
		}
	}
}


function clickPlayer (p)
{
	if (p == 0) {
		switch (gameState) {
		case "FaceUpResponse":
			var s = "";
			enableCards ("Waiting", "");
			for (i = 0; i < myCards.length; ++ i) {
				if (selectedCards[i] != 0) {
					s += "(" + myCards[i] + ")";
					faceupMyCard (i*4);
				}
			}
			if (s == "") {
				s = "()";
			}
			prompt (s);
			break;
		default:;
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

function faceupMyCard (i) 
{
	var location=getCardLocation (i);
	if (location.p == 0 ) {
		var c=document.getElementById('scene'+i);
		location.y -= 4;
    	c.style.top = location.y + 'vh';
	}
}

function login (player, code) {
	if (player != "" && code != "") {
		httpGetAsync("http://www.ialogic.com/cardgame" + 
			"?CardEvent=CardEventPlayerRegister" +
			"&player="+ player+
			"&code=" + code);
		session.player=player;
		session.code=code;
		return "Wait for response...";
	}
	else if (code.toUpperCase() == "TEST") {
		var testThread = setInterval(testLoop, testThreadInterval);
		session.player=testUsers[0];
		session.code=code;
		return "Waiting for test cases...";
	}
	return "Playe/Code Required";
}

function testLoop () 
{
	var testResponse=
		"<event name='CardEventGameIdle'>" +
		"<message> Game State:" + gameState + " ready for new test cases</message>" +
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
				"<message>New Player Joined " + testUsers[testStage-1] + "</message>";
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
				"<hand>(XC)(3D)(6D)(7D)(QD)(AD)(6H)(7H)(4S)(5S)(9S)(QS)(AS)</hand>" +
				"</player>";
			testResponse = testResponse + "</event>";
			break;
	case "Negotiate":
		testResponse=
			"<event name='CardEventFaceUp'>" +
			"<message>Choose Cards or Pass</message>" + 
			"<rule reason='Special card only' allowed='(AH)(QS)(XC)(JD)'/>";
			testResponse = testResponse + "</event>";
			testStage = 0;
			break;
	case "FaceUpResponse":
		if (testStage == 0) {
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='Chris' position='2'>" +
				"<faceup>(JD)</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
		}
		else if (testStage == 1) {
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='Tiff' position='3'>" +
				"<faceup>(AH)</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
		}
		else if (testStage == 2) {
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='Ying' position='1'>" +
				"<faceup>()</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
		}
		++testStage;
			break;
	default:;
	}
	handleResponseText (testResponse);
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
		hand = hand.replace(/\)\(/gi, ",").replace(/\)/,"").replace(/\(/g,"");
		dealCards (hand);
		break;
	case "CardEventFaceUp":
		var rule = response.getElementsByTagName("rule")[0];
		var reason = rule.getAttribute("reason");
		var allowed = rule.getAttribute("allowed");
		allowed = allowed.replace(/\)\(/gi, ",").replace(/\)/,"").replace(/\(/g,"");
		prompt (message);
		enableCards (reason, allowed);
		gameState = "FaceUpResponse";
		break;
	case "CardEventFaceUpResponse":
		var position = response.getElementsByTagName("player")[0].getAttribute("position");
		var cards = response.getElementsByTagName("faceup")[0].childNodes[0].nodeValue;
		cards = cards.replace(/\)\(/gi, ",").replace(/\)/,"").replace(/\(/g,"");
		showFaceup (position, cards);
		break;
	default:
		prompt ("Event Name:" + event);
	}
} 

function httpGetAsync(theUrl)
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


function prompt (text)
{
	var c=document.getElementById("prompt");
	c.innerHTML=text;
	c.style.display="block";
	var id = setInterval(dismiss, 3000);
	function dismiss () {
		c.style.display="none";
		clearInterval(id);
	}
}
function dismissPrompt ()
{
	var c=document.getElementById("prompt");
	c.style.display="none";
}

function mainLoop ()
{
	/*
	httpGetAsync("http://www.ialogic.com/cardgame" + 
			"?CardEvent=CardEventGameIdle" +
			"&player="+ session.player+
			"&code=" + session.code);
	*/
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
				gameState = "Ready";
				break;
		case "DealCards":
				gameState = "Negotiate";
				break;
		default:;
	}
}

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
		collectCards (i, carddeck[i].x, carddeck[i].y);
	}
}

function cleanup ()
{
	var table=document.getElementById("splash");
	var viewwidth=parseInt(table.style.width);
	var viewheight=parseInt(table.style.height);
	var ch=Math.floor(viewheight / 8);
	var cw=Math.floor(ch*0.7);

	for (i=0; i<52; ++i) {
		carddeck[i].x = (viewwidth-cw) / 2 - 1;
		carddeck[i].y = (viewheight-ch) / 2;
		var c = document.getElementById('card'+i);
		c.classList.toggle ('is-flipped', false);
		collectCards (i, carddeck[i].x, carddeck[i].y);
	}
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
		prompt("Test Move");
	}
}
