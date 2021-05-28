This is a HTML5/js/Java Server project for a multiplayer Hearts-like card game called Pig-Chase. (中文：拱猪). It also has a quite human like AI engine that can support team play of 1 - 3 players.

## To play the game click here: [https://www.ialogic.com](https://www.ialogic.com)

	Enter your name and the code "new" to start a new game and share the 4 digit code on screen with 
	your friends over video chat or conference call. You can add AI players to the game now.
	
	Click on the blue automplay icon to see an interactive demo and check your browser compatibility. 
	Latest versions of Chrome, Safari and Firefox should work fine on all devices. I personally don't 
	like MS IE or MS edge, but I did test edge and it works fine.
	
	Stay calm and have fun!

### For developers

The multiplayer game rule engine has a AI auto player interface that you can extend for more intelligent game play. 

	To test this without the time consuming human UI, run this program.

		com.ialogic.games.cards.CardPlayTest

	Input 4 player names and the test program will take them through a team game up to 100 rounds 
	or when either team's score is over +/-1000 in a second.

### Running game server:

	1. Start java server listening on your server port 8001, make sure ./WebContext is in the working directory
	
		com.ialogic.games.cards.server.CardHttpServer
	
	2. Use http://myhost:8001 to play
	
	3. Open your firewall to allow your friends to join or host it on a cloud server


### Development Log:

**05/07/2011**  Copyright year update and a minor score bug fixed

**02/05/2021**  Fixed the bug caused a suit to be considered "broken" when a card is discarded.
		
**06/01/2020**  Upgraded to http2 and SSL is much faster. Chrome timeout issue is solved. AI is enhanced
                to consider observation of discarded cards to better predict possible distribution
		of unknown positions.

**05/29/2020**	Encrypted the site with "Let's Encrypt" free certificates and we can now use Mobile
		Navigator share. It is a lot slower but more secure and "safe" looking to strangers.
		I had to tweak virtual host and a few timeout for Chrome and Edge so Apache 2.4 can
		reverse proxy both WebScket and SSE events. Headaches and good learning experience.

**05/27/2020**	Added Server-Side-Event (SSE) and WebSocket support for real time event handling.
		No more HTTP polling. Thanks to Chris for the initial suggestion and research.
		MS Edge only supports WebSocket and it is nice to get it to work.

**05/24/2020**	People start playing the single player game now and gave some really good feedback on 
		usability. I tweaked the AI so that it will use more heuristics instincts from human 
		players and more defensive in game play.

**05/21/2020**      Reoganized the Game Engine and plugged in AI. The game tree evaluation is implemted
                with random path explorers with decision based on simple min-max heuristic rules. 
		Further tweaking the algorithm can produce AI players of differnt styles of play.

**05/17/2020**	Major rewrite of client server communication to use JSON representation. Thanks 
		to Chris for the push. Reconnection and auto-play are more stable now.

**05/13/2020**	Finished multi-room support and rack the new Dell PowerEdge server.

**05/11/2020**	Reorganized client side code and finished standalone server so you don't need Apache. 
		Thanks Chris for the idea. Credit to SUN Microsystem's pure java HTTP server.
		(Note, I started programming on a Sun Workstation back in 1988, AutoCAD and Fortran 77)

**05/09/2020**	Cleaned up layout calculations and improved points display. Thanks to everyone who played
		the game and provided feedback.

**05/08/2020**	Reorganized the code and added a help screen. Multi-room next.

**05/07/2020**      Allow state recovery for disconnected players. Clean up client side code.

**05/05/2020**	Got a new Dell PowerEdge server to host the game server and fixed bug for Firefox game play.

**05/04/2020**	Closed most of the issues and add build and run scripts

**05/03/2020**	Start new game with code "new" is supported.

**05/02/2020**      Test run with friends and updated READ ME for general public.

**05/02/2020**      Finally it is ready for multiplayer. Auto play is still glitchy.

**04/20/2020**	I have the basic client HTML5 and JS framework and a sun java HTTP server proxy through Apache
