This is the java source code for a Hearts-like card game called Pig-Chase. (中文：拱猪)

The multiplayer game rule engine has a dummy auto player interface that you can extend for more intelligent game play. To test this without the time consuming human UI, run this program.

	com.ialogic.games.cards.CardPlayTest

	Input 4 player names and the test program will take them a team game up to 100 rounds or when either team's score is over +/-1000 in a second.

For human players, HTML5 + and server side java is done. User management and multiple room game play is underway. I just created issues list to keep track of things to do.

To run your own game server:

	1. Serve WebContent (index.html, js, cs, image) in Apache or any simple HTTP server
	
	2. Start java server listening on you server port 8001
	
		com.ialogic.games.cards.server.CardHttpServer
	
	3. Redirect relative url "/cardgame" to your appserverhost:8001

For a demo, use the following link.

		http://www.ialogic.com/

	Leave the player name blank and enter "test" to see the demo and check your browser compatibility. 
	Latest versions of Chrome, Safari and Firefox should work fine on all devices. 
	I personally don't like MS IE or MS edge. 


Development Log:

04/20/2020	I have the basic client HTML5 and JS framework and a basic java HTTP server proxy through Apache

05/02/2020      Finally it is ready for multiplayer. Auto play is still glitch.

05/02/2020      Test run with friends and updated READ ME for general public.

05/03/2020	Start new game with code "new" is supported.


Stay Calm and Have fun!

Steve Yu
