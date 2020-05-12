package com.ialogic.games.cards.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Queue;
import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerReconnect;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventPlayerUpdate;
import com.ialogic.games.cards.event.CardEventWaitForPlayers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class CardHttpServer implements CardUI {
	static CardHttpServer instance = null;
    HttpServer server;
	public CardHttpServer (final int port){
		if (instance == null) {
			try {
				instance = this;
				server = HttpServer.create(new InetSocketAddress(port), 0);
				HttpContext context = server.createContext("/");
				context.setHandler(CardHttpServer::handleRequest);
				server.start();
				log ("SERVER: HTTP Server on %d Started.", port);
				
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	private static void handleRequest(HttpExchange exchange) throws IOException {
	      URI requestURI = exchange.getRequestURI();
		  String response = "<html>Invalid URI<html>";
	      String path = requestURI.getPath();
	      String query = requestURI.getQuery();
	      if ((path.contentEquals("/") || path.contentEquals("/cardgame"))
	    		  && query != null && !query.isEmpty()) {
	    	  response = getServer().createResponse (query);
			  exchange.sendResponseHeaders(200, response.getBytes().length);
			  OutputStream os = exchange.getResponseBody();
			  os.write(response.getBytes());
			  os.close();
	      }
	      else {
	    	  if (path.contentEquals("/")) {
	    		  path = "index.html";
	    	  }
	    	  path = "WebContent/" + path;
	    	  File file = new File (path);
	    	  if (file.exists()) {
				  exchange.sendResponseHeaders(200, file.length());
				  FileInputStream fs = new FileInputStream (file);
				  OutputStream os = exchange.getResponseBody();
				  byte buffer[] = new byte[65536];
				  while (fs.available() > 0) {
					  int len = fs.read(buffer);
					  os.write(buffer, 0, len);
				  }
				  os.close();
				  fs.close();
	    	  }
	    	  else {
		    	  getServer().log ("File not found %s", path);
				  exchange.sendResponseHeaders(200, response.getBytes().length);
				  OutputStream os = exchange.getResponseBody();
				  os.write(response.getBytes());
				  os.close();
	    	  }
	      }
	}
	private String createResponse(String query) {
		String response = "<event name='CardEventServerReject'><status>REJECT</status>" + 
				"<message>Error</message></event>";
		try {
			HashMap<String, String>request = parseQuery(query);
			String eventName = request.get("CardEvent");
			String clz = "com.ialogic.games.cards.event." + eventName;
			String player = request.get("player");
			String clientCode = request.get("code").toUpperCase();
			
			@SuppressWarnings("rawtypes")
			Class[] paramType = {String.class};
			CardEvent e = (CardEvent) Class.forName(clz).getConstructor(paramType).newInstance(eventName);
			if (!(e instanceof CardEventPlayerUpdate)) {
				log ("SERVER: %s %s Event from player %s.", clientCode, clz, player);
			}
			if (e instanceof CardEventPlayerRegister) {
				int pos = 0;
				String status = "OK";
				String m = "";
				GameRoom room = GameRoom.getRoom(clientCode);
				
				if (clientCode.contentEquals("NEW")) {
					room = GameRoom.createGameRoom ();
					CardGame game = room.getGame();
					game.setUi(this);
					new Thread () {
						public void run () {
							game.play();
						}
					}.start();
					synchronized (game) {
						log ("SERVER: %s Waiting for game to request player", room.getCode());
						game.wait();
					}
					m = String.format ("New Game Started, use code %s to join.", room.getCode());
					log ("SERVER: " + m);
				}
				else if (room != null && room.getSessions().containsKey(player)) {
					m = String.format ("Rejoining with code: %s", clientCode);
					status = "OK";
				}
				else if (room != null) {
					CardGame game = room.getGame();
					if (!game.isGameOver() && game.getPlayers().size() < 4 ) {
						m = String.format ("Joining with code %s:", clientCode);
						status = "OK";
					}
					else if (!game.isGameOver()) {
						m = "Game in progress, please use 'new' to a start new game.";
						status = "REJECT";
					}
					else {
						m = "The game is over, please use 'new' to start a new game.";
						status = "REJECT";
					}
				}
				else {
					m = String.format ("Code %s is not valid, please use 'new' to join.", clientCode);
					status = "REJECT";
				}
				if (status.contentEquals("OK") && room != null) {
					HashMap<String, CardPlayer> sessions = room.getSessions();
					CardPlayerHttpClient c = (CardPlayerHttpClient) sessions.get(player);
					m = "Wecome back!";
					if (c == null) {
						c = new CardPlayerHttpClient (player, room.getCode());
						synchronized (sessions) {
							c.setPosition (sessions.size());
							sessions.put(player, c);
						}
						m = "Welcome!";
						e.setMessage(m);
					}
					else {
						m = "Welcome back!";
						e = new CardEventPlayerReconnect (m);
					}
					((CardEventPlayerRegister)e).setAllPlayers (sessions.values());
					e.setPlayer(c);
					c.handleEvent(this, e);
					pos = c.getPosition();
				}
				response = String.format("<event name='CardEventLoginAck'><status>%s</status>" + 
						"<player name='%s' code='%s' position='%d'/>" +
						"<message>%s, %s!</message></event>", status, player, (room == null ? "" : room.getCode()), pos, player, m);
				log ("SERVER:" + response);
			}
			else if (GameRoom.getRoom(clientCode) != null && GameRoom.getRoom(clientCode).getSessions().containsKey(player)) {
				CardPlayer c = GameRoom.getRoom(clientCode).getSessions().get(player);
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
			else {
				log ("SERVER: Exception - "  + query);
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
	private void log(String format, Object...args) {
		System.out.println (String.format(format, args));
	}
	public void showText(String text) {
		log ("Game Text: " + text);
	}
	public void open(CardGame cardGame) {
		GameRoom room = GameRoom.findRoom (cardGame);
		addEvent(room, new CardEventGameStart ());
		log ("SERVER: Game %s %s Started.", cardGame.getName(), room.getCode());
	}
	public void close(CardGame cardGame) {
		GameRoom room = GameRoom.findRoom (cardGame);
		// GameRoom.closeRoom (room.getCode());
		log ("SERVER: Game %s %s Stopped.", cardGame.getName(), room.getCode());
	}

	public void sendEvent(CardGame cardGame, CardEvent request) {
		GameRoom room = GameRoom.findRoom(cardGame);
		if (request instanceof CardEventWaitForPlayers) {
			synchronized (room.getGame()) {
				room.getGame().notifyAll();
			}
			return;
		}
		if (request instanceof CardEventGameOver) {
			addEvent(room, request);
		}
		if (request.getPlayer() != null) {
			log ("Send: %s %s - %s", room.getCode(), request.getMessage(), request.getPlayer().getName());
			CardPlayer p = request.getPlayer();
			p.handleEvent (this, request);
		}
		else {
			log ("Send: %s %s", room.getCode(), request.getMessage());
			for (CardPlayer p : cardGame.getPlayers()) {
				p.handleEvent (this, request);
			}
		}
	}
	public void playerEvent(CardEvent request) {
		String code = ((CardPlayerHttpClient) request.getPlayer()).getCode();
		GameRoom room = GameRoom.getRoom(code);
		addEvent (room, request);
		for (CardPlayer c : room.getSessions().values()) {
			if (c != request.getPlayer()) {
				c.handleEvent(this, request);
			}
		}
		log ("Recv: %s Player Event - %s", room.getCode(), request.getXMLString());
	}
	public CardEvent getEvent(CardGame cardGame) {
		GameRoom room = GameRoom.findRoom (cardGame);
		Queue<CardEvent>events = room.getEvents();
		synchronized (events) {
			if (events.isEmpty()) {
				try {
					events.wait();
				} catch (InterruptedException e1) {
					log ("SERVER: Game %s Interrupted", room.getCode());
					return new CardEventGameOver ();
				}
			}
			CardEvent e = events.remove ();
			return e;
		}
	}
	private void addEvent(GameRoom room, CardEvent e) {
		Queue<CardEvent>events = room.getEvents();
		synchronized (events) {
			events.add(e);
			events.notifyAll();
		}
	}
	static public void main (String args[]) {
		new CardHttpServer (8001);
	}
}
