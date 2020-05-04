package com.ialogic.games.cards.server;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Queue;
import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.PigChase;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventPlayerUpdate;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class CardHttpServer implements CardUI {
//============================================================================================
// TODO use code to organize them to rooms;
	static CardHttpServer instance = null;
    HttpServer server;
	CardGame game=null;
	String code;
	Queue<CardEvent>events = new LinkedBlockingQueue<CardEvent> ();
	HashMap<String, CardPlayer> sessions = new HashMap<String, CardPlayer> ();
//============================================================================================
	public CardHttpServer (final int port){
		if (instance == null) {
			try {
				instance = this;
				server = HttpServer.create(new InetSocketAddress(port), 0);
				HttpContext context = server.createContext("/");
				context.setHandler(CardHttpServer::handleRequest);
				server.start();
				System.out.println(String.format ("Game Server on %d Started.", port));
				
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	private static void handleRequest(HttpExchange exchange) throws IOException {
		  // printRequestInfo (exchange);
	      URI requestURI = exchange.getRequestURI();
		  String response = "Invalid URI";
	      String path = requestURI.getPath();
	      String query = requestURI.getQuery();
	      if (path.contentEquals("/") && !query.isEmpty()) {
	    	  response = getServer().createResponse (query);
	      }
		  exchange.sendResponseHeaders(200, response.getBytes().length);
		  OutputStream os = exchange.getResponseBody();
		  os.write(response.getBytes());
		  os.close();
	}
	private String createResponse(String query) {
		String response = "<event name='CardEventLoginAck'><status>ERROR</status>" + 
				"<message>Please Login</message></event>";
		try {
			HashMap<String, String>request = parseQuery(query);
			String eventName = request.get("CardEvent");
			String clz = "com.ialogic.games.cards.event." + eventName;
			String player = request.get("player");
			
			@SuppressWarnings("rawtypes")
			Class[] paramType = {String.class};
			CardEvent e = (CardEvent) Class.forName(clz).getConstructor(paramType).newInstance(eventName);
			if (!(e instanceof CardEventPlayerUpdate)) {
				System.out.println(String.format("DEBUG: %s Event from player %s.", clz, player));
			}
			if (e instanceof CardEventPlayerRegister) {
				String status = "OK";
				String m = "";
				int pos = 0;
				if (request.containsKey("code") && request.get("code").toUpperCase().contentEquals("NEW") || game == null || game.isGameOver()) {
					if (game != null) {
						game.handleEvent(new CardEventGameOver());
					}
					sessions.clear();
					events.clear();
					game = new PigChase ();
					game.setUi(this);
					new Thread () {
						public void run () {
							game.play();
						}
					}.start();
					code = "4321"; // TODO, Randomize this code
					m = String.format ("New Game Started, use code %s to join.", code);
					System.out.println (m);
				}
				else if (game == null) {
					m = game == null ? "Use 'new' to start game" : "Game is in progress";
					status = "REJECT";
				}
				if (sessions.containsKey(player)) {
					CardPlayerHttpClient c = (CardPlayerHttpClient) sessions.get(player);
					m = "Wecome back!";
					pos = c.getPosition();
					// TODO: Play back message log to catch up;
				}
				else {
					if (status.contentEquals("OK")) {
						CardPlayerHttpClient c = new CardPlayerHttpClient (player, this);
						synchronized (sessions) {
							c.setPosition (sessions.size());
							sessions.put(player, c);
						}
						((CardEventPlayerRegister)e).setAllPlayers (sessions.values());
						e.setPlayer(c);
						c.handleEvent(this, e);
						m = "Wecome!";
						pos = c.getPosition();
					}
				}
				response = String.format("<event name='CardEventLoginAck'><status>%s</status>" + 
						"<player name='%s' position='%d'/>" +
						"<message>%s, %s!</message></event>", status, player, pos, player, m);
				System.out.println(response);
			}
			else if (sessions.containsKey(player)) {
				CardPlayer c = sessions.get(player);
				e.setPlayer(c);
				if (e instanceof CardEventPlayerUpdate) {
					response = ((CardPlayerHttpClient)c).getEventFromQueue ();
				}
				else if (e instanceof CardEventFaceUpResponse || e instanceof CardEventPlayerAction) {
					e.setFieldValues (request);
					((CardPlayerHttpClient)c).handleEvent(this, e);
					response = "<event name='CardEventPlayerAck'><status>OK</status>" + 
							"<message>Action Received</message></event>";
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return response;
	}
	private static CardHttpServer getServer() {
		return instance;
	}
	private static HashMap<String, String> parseQuery(String query) {
		HashMap<String, String> nvPairs = new LinkedHashMap<String, String>();
		String[] pairs = query.split("&");
		for (String s : pairs) {
			int idx = s.indexOf("=");
			if (idx > 0) {
				try {
					nvPairs.put(URLDecoder.decode(s.substring(0, idx), "UTF-8"), 
							URLDecoder.decode(s.substring(idx + 1), "UTF-8"));
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
			}
		}
		return nvPairs;
	}
	public void showText(String text) {
		System.out.println ("DEBUG: " + text);
	}
	public void open(CardGame cardGame) {
		game = cardGame;
		addEvent(new CardEventGameStart ());
		System.out.println(String.format ("Game %s Started.", cardGame.getName()));
		showText ("Welcome to a game of \"" + cardGame.getName() + "\"!");
	}

	public void close(CardGame cardGame) {
		showText ("Good bye!");
		System.out.println(String.format ("Game %s Stopped.", cardGame.getName()));
	}

	public void sendEvent(CardGame cardGame, CardEvent request) {
		if (request instanceof CardEventGameOver) {
			addEvent(request);
		}
		if (request.getPlayer() != null) {
			System.out.println(String.format ("Debug: %s - %s", request.getMessage(), request.getPlayer().getName()));
			CardPlayer p = request.getPlayer();
			p.handleEvent (this, request);
		}
		else {
			System.out.println(String.format ("Debug: %s", request.getMessage()));
			for (CardPlayer p : cardGame.getPlayers()) {
				p.handleEvent (this, request);
			}
		}
	}
	public void playerEvent(CardEvent request) {
		addEvent (request);
		for (CardPlayer c : sessions.values()) {
			if (c != request.getPlayer()) {
				c.handleEvent(this, request);
			}
		}
		System.out.println(String.format ("Debug: Player Event - %s", request.getXMLString()));
	}
	public CardEvent getEvent(CardGame cardGame) {
		synchronized (events) {
			if (events.isEmpty()) {
				try {
					events.wait();
				} catch (InterruptedException e1) {
					showText ("Interrupted");
					return new CardEventGameOver ();
				}
			}
			CardEvent e = events.remove ();
			return e;
		}
	}
	private void addEvent(CardEvent e) {
		synchronized (events) {
			events.add(e);
			events.notifyAll();
		}
	}
	static public void main (String args[]) {
		new CardHttpServer (8001);
	}
}
