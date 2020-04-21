function startGame() 
{
	var player=document.getElementById("player").value;
	var code=document.getElementById("code").value;
	var splash = document.getElementById("splash");
	
	if (splash.requestFullScreen)
		splash.requestFullScreen();
	
	if (login(player, code) == "OK") {
		var x=document.getElementById("over");
		x.parentNode.removeChild(x);
		splash.style.backgroundImage="url('image/table.jpg')";
		splash.style.opacity="1";
		setUpTable();
	}
}


function setUpTable() {
	showDeck ();
	showPlayers ();
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
		scene.style.left=(Math.random() * (viewwidth-cw)) + "vw";
		scene.style.top=(Math.random() * (viewheight-ch)) + "vh";
		scene.style.display='block';
		
		var c=document.createElement('div');
		scene.appendChild(c);
		c.setAttribute('id', 'card'+i);
		c.setAttribute('onClick', 'clickCard('+i+')');
		c.classList.add('card');
		
		var cf=document.createElement('div');
		c.appendChild(cf);
		cf.classList.add('card__face', 'card__face--front');
		
		var cb=document.createElement('div');
		c.appendChild(cb);
		cb.classList.add('card__face', 'card__face--back');

		collect(i, (viewwidth-cw)/2, (viewheight-ch)/2);
	}
}

function showPlayers ()
{
	var table=document.getElementById("splash");
	for (p = 0; p < 4; ++p) {
		var l = getPlayerLocation (p);
		var view=document.createElement('div');
		table.appendChild(view);
		view.classList.add('logo');
		view.style.left = l.x + 'vw';
		view.style.top = l.y + 'vh';
	}
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

function dealCards()
{
  var speed=10;
  var i = 0;
  var c = document.getElementById("scene" + i);   
  var step = speed;
  var location=getCardLocation (i);
  var x=location.x;
  var y=location.y;
  var p=location.p;
  var id = setInterval(frame, 5);
  
  function frame() {
	if (i == 52) {
      clearInterval(id);
	}
	else {
		if (step <= 0) {
	      c.style.left=x+'vw'; 
	      c.style.top=y+'vh';
	      if (p == 0)
	    	  flipCard(i);
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

function collect(i, x,y) 
{
  var c = document.getElementById("scene" + i);   
  var step = 100;
  var id = setInterval(frame, 25);
  
  function frame() {
    if (step <= 0) {
      c.style.left=x+'vw'; 
      c.style.top=y+'vh';  
      clearInterval(id);
	  flipCard(i);
	  if (i == 51) {
		  dealCards();
	  }
    } else {
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
	httpGetAsync("http://www.ialogic.com/cardgame" + 
			"?CardEvent=CardEventPlayerRegister" +
			"&player="+ player+
			"&code=" + code);
	return "OK";
}

function httpGetAsync(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); 
    xmlHttp.send(null);
    alert (xmlHttp.responseText);
}
