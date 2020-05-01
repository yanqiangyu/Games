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
	CardGame game;
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
				"<message>Unexpected Event, please restart.</message></event>";
		try {
			System.out.println (query);
			HashMap<String, String>request = parseQuery(query);
			String clz = "com.ialogic.games.cards.event." + request.get("CardEvent");
			String player = request.get("player");
			@SuppressWarnings("rawtypes")
			Class[] paramType = {String.class};
			CardEvent e = (CardEvent) Class.forName(clz).getConstructor(paramType).newInstance("Client Request");
			e.setFieldValues (request);
			if (!(e instanceof CardEventPlayerUpdate)) {
				System.out.println(String.format("DEBUG: %s Event from player %s.", clz, player));
			}
			if (e instanceof CardEventPlayerRegister) {
				if (sessions.containsKey(player)) {
					CardPlayerHttpClient c = (CardPlayerHttpClient) sessions.get(player);
					response = String.format("<event name='CardEventLoginAck'><status>OK</status>" + 
								"<message>Player %s welcome back!</message>" +
								"<player name='%s' position='%d'/></event>", c.getName(), c.getPosition());
					System.out.println(String.format ("Existing Client %s", player));
					// TODO: Play back message log to catch up;
				}
				else {
					CardPlayerHttpClient c = new CardPlayerHttpClient (player, this);
					synchronized (sessions) {
						c.setPosition (sessions.size());
						sessions.put(player, c);
					}
					((CardEventPlayerRegister)e).setAllPlayers (sessions.values());
					
					e.setPlayer(c);
					c.handleEvent(this, e);
					playerEvent(e);
					
					System.out.println(String.format ("New Client %s", c.getName()));
					response = String.format("<event name='CardEventLoginAck'><status>OK</status>" + 
							"<player name='%s' position='%d'/>" +
							"<message>Welcome %s!</message></event>", c.getName(), c.getPosition(), c.getName());
				}
			}
			else if (sessions.containsKey(player)) {
				CardPlayer c = sessions.get(player);
				e.setPlayer(c);
				if (e instanceof CardEventPlayerUpdate) {
					response = ((CardPlayerHttpClient)c).getEventFromQueue ();
				}
				else if (e instanceof CardEventFaceUpResponse || e instanceof CardEventPlayerAction) {
					playerEvent (e);
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
	/*
	private static void printRequestInfo(HttpExchange exchange) {
	      System.out.println("-- Remote Address --");
	      System.out.println(exchange.getRemoteAddress().getHostName());
	      System.out.println("-- HTTP method --");
	      System.out.println(exchange.getRequestMethod());
	      URI requestURI = exchange.getRequestURI();
	      System.out.println("-- uri --");
	      System.out.println(requestURI.toString());
	      System.out.println("-- query --");
	      System.out.println(requestURI.getQuery());
	      System.out.println("-- path --");
	      System.out.println(requestURI.getPath());
	}
	*/
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
		game = null;
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
		CardGame game = new PigChase ();
		CardHttpServer server = new CardHttpServer (8001);
		game.setUi(server);
		game.play ();
	}
}
