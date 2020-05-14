//===============================================
// Card image and location
//===============================================
var center={x:0, y:0,};
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

function allowCard (i, is_allowed) 
{
	selectMask[i] = is_allowed;
	var idx=i*4;
	var cd=document.getElementById('card'+idx);
	cd.classList.toggle ('player_input', is_allowed);
}

//=========================================================
//Random effects to show when waiting  
//=========================================================
var animationPlaying = false;
function randomMove ()
{
	animationPlaying = true;
	var count = 0;
	for (i=0; i<52; ++i) {
		var x = carddeck[i].x + (Math.random() - 0.5) * 30;
		var y = carddeck[i].y + (Math.random() - 0.5) * 30;
		
		if (x > 80) x = 160 - x;
		if (y > 80) y = 160 - y;
		if (x < 10) x = 20 - x;
		if (y < 10) y = 20 - y;
		carddeck[i].x = x;
		carddeck[i].y = y;
		moveCardEffect (i, carddeck[i].x, carddeck[i].y, loop, 100, 25, true);
	}
	function loop () {
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
//Animated card move effect
//Next effects is based on gameState for now,
//it can be improved to use a call back function
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
		logo.style.backgroundImage="url('image/brass.jpg')";
		logo.innerHTML="<BR>Score";
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
	myPlayers[p%4]=name;
}

function flashPlayer (p, on)
{
	var player=document.getElementById("player"+p);
	player.classList.toggle("player_input", on);
	player.style.cursor = ((on && p == 0) ? "pointer" : "");
}

//*******************************************************************************
//Location calculations
//Player, Card, Point Cards after a round
//*******************************************************************************
function getPlayerLocation (p) {
	// Center card position for each player;
	var l = {x: 0, y: 0,};
	  var dx = (p == 0 || p == 2) ? 0  : ((p == 1) ? 15 : -15);
	var dy = (p == 1 || p == 3) ? 0  : ((p == 0) ? 15 : -15);
	
	l.x = center.x + dx - 1;
	l.y = center.y + dy;
	
	return l;
}

function getCardLocation (i)
{
	var l = {x: 0, y: 0, p:0,};
	var p = i%4;
	var n = Math.floor (i/4); 
	var dx = (p == 0 || p == 2) ? (p == 0 ? 0 : 3)  : ((p == 1) ? 10 : -10);
	var dy = (p == 1 || p == 3) ? (p == 1 ? 0 : 2)  : ((p == 0) ? 10 : -10);
	
	l.p = p;
	l.x = ((p == 0 || p == 2) ? (p == 0 ? n*4 : 48-n*4) : (p == 1 ? 48 : 0)) + dx + center.x - 24;
	l.y = ((p == 1 || p == 3) ? (p == 3 ? n*4 : 48-n*4) : (p == 0 ? 48 : 0)) + dy + center.y - 24;
	
	return l;
}

function getPointCardLocation (i, p)
{
	var d = ((playerPoints[p].length - 1) % 13) * 4 + p;
	var l = getCardLocation (d);
	var m = (playerPoints[p].length < 14 ? 1 : 1.5);
	var dx = (p == 0 || p == 2) ? (p == 0 ? -2 : 2)  : ((p == 1) ? 5 : -5);
	var dy = (p == 1 || p == 3) ? (p == 1 ? 2 : -2)  : ((p == 0) ? 5 : -5);
	
	l.x += dx * m;
	l.y += dy * m;
	
	return l;
}
