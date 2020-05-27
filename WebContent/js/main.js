// *******************************************************************************
// Main UI Control Functions:
// These functions are called by the Browser objects.
// Changing the names requires change in index.html.
// *******************************************************************************
// Global variables
//
var gameState = "Initial";
var autoPlayGame = false;

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

function sendLogin()
{
	var player=document.getElementById("player").value;
	var code=document.getElementById("code").value;
	prompt (login (player, code));
}

function clickLogo () {
	if (gameState != "Initial") {
		var c=document.getElementById("score");
		c.style.display="block";
	}	
}

function dismiss (c)
{
	c.style.display="none";
}

function toggleAutoPlay () {
	switch (gameState) {
	case "Initial":
		document.getElementById("player").value="";
		document.getElementById("code").value="test";
		autoPlayGame=true;
		setTimeout (sendLogin, 0);
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

function disableLogin ()
{
	var c=document.getElementById("over");
	c.style.display="none";
}

function enableLogin ()
{
	var c=document.getElementById("over");
	c.style.display="block";
}

function helpCode ()
{
	var c=document.getElementById("code");
	c.value = "";
	prompt ("Enter 'new' to start a new game");
}

function checkBrowser () {
	if (typeof(EventSource) === "undefined" && !("WebSocket" in window)) {
		prompt ("We are sorry that your browser is not supported.<BR>Please upgrade or install Firefox, Safari or Chrome.");
		disableLogin ();
	}
}