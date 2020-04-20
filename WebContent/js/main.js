function startGame() 
{
	var player=document.getElementById("fname").value;
	// disable overlay;
	var x=document.getElementById("over");
	x.parentNode.removeChild(x);
	// show table
	var splash = document.getElementById("splash");
	splash.style.backgroundImage="url('image/table.jpg')";
	splash.style.opacity="1";
	
	createDeck();
}


function createDeck()
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
		document.getElementById("splash").appendChild(scene);
		scene.style.width="75px";
		scene.style.height="105px";
		scene.style.left=(Math.random() * (viewwidth-cw)) + "vw";
		scene.style.top=(Math.random() * (viewheight-ch)) + "vh";
		scene.style.display='block';
		
		var c=document.createElement('div');
		scene.appendChild(c);
		c.setAttribute('id', 'card'+i);
		c.setAttribute('onClick', 'flipcard('+i+')');
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

function getCardLocation (i)
{
  var c = document.getElementById("scene" + i);   
  var player = i%4;
  var n = Math.floor(i/4);
  var x=0;
  var y=0;
  var rotate=0;
  var location = {x: 0, y: 0,};
  
  if (player == 0) {
	  x = n*4 + 15;
	  y = 75;
  }
  else if (player == 1) {
	  x = 75;
	  y = 64 - n*4;
	  c.classList.add("rotated");  
  }
  else if (player == 2) {
	  x = 64 - n*4;
	  y = 5;
  }
  else if (player == 3) {
	  x = 5;
	  y = n*4 + 16;
	  c.classList.add("rotated");  
  }
  location.x = x;
  location.y = y;
  return location;
}

function dealCards()
{
  var i = 0;
  var c = document.getElementById("scene" + i);   
  var step = 50;
  var location=getCardLocation (i);
  var x=location.x;
  var y=location.y;
  var id = setInterval(frame, 10);
  
  function frame() {
	if (i == 52) {
      clearInterval(id);
	}
	if (step <= 0) {
      c.style.left=x+'vw'; 
      c.style.top=y+'vh';
      ++i;
      c = document.getElementById("scene" + i);   
      location=getCardLocation (i);
      x=location.x;
      y=location.y;
      step = 50;
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
	  flipcard(i);
	  dealCards();
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

function flipcard(i)
{
	var c=document.getElementById('card'+i);
	c.classList.toggle('is-flipped');
}



