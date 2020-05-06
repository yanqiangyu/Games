This is a HTML5/js/Jave Server project for a Multiplayer Hearts-like card game called Pig-Chase. (中文：拱猪).

The game URL:
		http://www.ialogic.com/

	Enter you name and code "new" to start a new game and share the 4 digit code on screen with your
	friends over video chat or conference call.
	
	Leave the player name blank and enter "test" to see the demo and check your browser compatibility. 
	Latest versions of Chrome, Safari and Firefox should work fine on all devices. 
	I personally don't like MS IE or MS edge. 
	
	Stay calm and have fun!

For developers, the multiplayer game rule engine has a dummy auto player interface that you can extend for more 
intelligent game play. To test this without the time consuming human UI, run this program.

		com.ialogic.games.cards.CardPlayTest

	Input 4 player names and the test program will take them through a team game up to 100 rounds 
	or when either team's score is over +/-1000 in a second.

To run your own game server:

	1. Serve WebContent (index.html, js, cs, image) using Apache or any simple HTTP server
	
	2. Start java server listening on your server port 8001
	
		com.ialogic.games.cards.server.CardHttpServer
	
	3. Redirect relative url "/cardgame" to your appserverhost:8001 (using Apache 2 Virtual host)


Development Log:

05/05/2020	Got a new Dell PowerEdge server to host the game server and fixed bug for Firefox game play.

05/04/2020	Closed most of the issues and add build and run scripts

05/03/2020	Start new game with code "new" is supported.

05/02/2020      Test run with friends and updated READ ME for general public.

05/02/2020      Finally it is ready for multiplayer. Auto play is still glitch.

04/20/2020	I have the basic client HTML5 and JS framework and a basic java HTTP server proxy through Apache

Steve Yu
