var idleThread;
var gameState = "Initial";
var session = {player: "", code: "",};
var pollingInterval = 5000;
var testThreadInterval = 5000;
var testStage = 0;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];

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
  var codes = hand.split(",");
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
	    	  var cf=document.getElementById('cardface'+i);
	    	  cf.style.backgroundImage="url('image/cards/" + codes[Math.floor(i/4)] + ".jpg')";
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

function clickCard (i)
{
	var location=getCardLocation (i);
	if (location.p == 0 ) {
		var c=document.getElementById('scene'+i);
	    var cy=parseFloat(c.style.top, 10);
	    if (cy >= location.y - 0.1) {
	    	c.style.top=cy - 2 + 'vh';
	    }
	    else {
	    	c.style.top=location.y + 'vh';
	    }	
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
				"<message>Waiting for game to start</message>" +
				"</event>";
		}
		else if (testStage < 5) {
			testResponse=
				"<event name='CardEventPlayerRegister'>" +
				"<message>New Player Joined " + testStage + "</message>";
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
				"<message>Let's play</message>";
				testResponse = testResponse + "</event>";
		}
		break;
	case "Ready":
		testResponse=
			"<event name='CardEventDealCards'>" +
			"<message>Dealing Cards</message>" +
				"<player name='Steve' position='0'>" +
				"<hand>(3C)(5C)(JC)(KC)(7D)(8D)(AD)(7H)(9H)(AH)(3S)(JS)(KS)</hand>" +
				"</player>";
			testResponse = testResponse + "</event>";
			break;
	case "Negotiate":
		testResponse=
			"<event name='CardEventFaceUp'>" +
			"<message>Choose Cards or pass</message>" + 
			"<rule reason='Show Special card For double points' allowed='(AH)(QS)(XC)(JD)'/>";
			testResponse = testResponse + "</event>";
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
	prompt ("Game State:" + gameState + "Message:" + message );
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
		// enableCards (reason, allowed);
		gameState = "FaceUpResponse";
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
}
