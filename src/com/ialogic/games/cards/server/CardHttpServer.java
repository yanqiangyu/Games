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
import java.util.Map;
import java.util.concurrent.Executors;

import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventGameIdle;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.event.CardEventLoginAck;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerReconnect;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventPlayerUpdate;
import com.ialogic.games.cards.event.CardEventServerReject;
import com.ialogic.games.cards.event.CardEventWaitForPlayers;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;


public class CardHttpServer implements CardUI, ServerEventListener {
	static CardHttpServer instance = null;
	WebSocketServer wsServer = null;
    HttpServer server;
	public CardHttpServer (final int port){
		if (instance == null) {
			try {
				instance = this;
				server = HttpServer.create(new InetSocketAddress(port), 0);
				HttpContext context = server.createContext("/");
				context.setHandler(CardHttpServer::handleRequest);
				server.setExecutor(Executors.newCachedThreadPool());
				server.start();
				wsServer = new WebSocketServer (8011);
				wsServer.setListener (this);
				wsServer.start();
				log ("SERVER: HTTP Server on %d Started.", port);
				
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	private static void handleRequest(HttpExchange exchange) {
		try {
			getServer().createResponse (exchange);
		} catch (IOException e) {
			getServer().log ("Exeption" + e);
		}
	}
	public void handleWebSocket (String id, String message) {
		log ("SERVER: WS %s message %s", id, message);
		HashMap<String, String>request = parseQuery(message);
		String eventName = request.get("CardEvent");
		boolean validated = false;
		if (eventName != null && eventName.contentEquals("CardEventPlayerUpdate")) {
			String player = request.get("player");
			String code = request.get("code").toUpperCase();
			if (player != null && code != null && GameRoom.getRoom(code) != null) {
				CardPlayerHttpClient c = (CardPlayerHttpClient) GameRoom.getRoom(code).getSessions().get(player);
				if (c != null) {
					c.openSubscription(wsServer, id);
					validated = true;
				}
			}
		}
		if (!validated) {
			log ("SERVER: WS %s message %s invalid request", id, message);
			// wsServer.close (id);
		}
	}
	private void createResponse (HttpExchange exchange) throws IOException {
	      URI requestURI = exchange.getRequestURI();
		  String response = "Invalid URI";
	      String path = requestURI.getPath();
	      String query = requestURI.getQuery();
	      
	      if ((path.contentEquals("/") || path.contentEquals("/cardgame"))
	    		  && query != null && !query.isEmpty()) {
	    	  response = getServer().createResponse (query, exchange);
	    	  if (!response.isEmpty()) {
	    		  Headers headers = exchange.getResponseHeaders();
	    		  headers.set ("Content-Type", "text/html");
	    		  headers.set ("Cache-Control", "no-cache");
	    		  headers.set ("Connection", "keep-alive");
				  exchange.sendResponseHeaders(200, response.length());
				  OutputStream os = exchange.getResponseBody();
				  os.write(response.getBytes());
				  os.close();
	    	  }				 
	      }
	      else {
	    	  if (path.contentEquals("/")) {
	    		  path = "index.html";
	    	  }
	    	  path = "WebContent/" + path;
	    	  File file = new File (path);
	    	  if (file.exists()) {
				  Headers headers = exchange.getResponseHeaders();
				  if (path.contains("css")) {
					  headers.set ("Content-Type", "text/css");
				  }
				  else if (path.contains("js")) {
					  headers.set ("Content-Type", "text/javascript");
				  }
				  exchange.sendResponseHeaders(200, file.length());
				  OutputStream os = exchange.getResponseBody();
				  FileInputStream fs = new FileInputStream (file);
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
	
	private String createResponse(String query, HttpExchange exchange) {
		String response = new CardEventServerReject ().getJsonString();
		try {
			HashMap<String, String>request = parseQuery(query);
			String eventName = request.get("CardEvent");
			String clz = "com.ialogic.games.cards.event." + eventName;
			String player = request.get("player");
			String clientCode = request.get("code").toUpperCase();
			
			@SuppressWarnings("rawtypes")
			Class[] paramType = {String.class};
			CardEvent e = (CardEvent) Class.forName(clz).getConstructor(paramType).newInstance(eventName);
			
			if (e instanceof CardEventPlayerUpdate) {
				log ("SERVER: %s %s Subscription from player %s.", clientCode, clz, player);
				if (player != null && clientCode != null && GameRoom.getRoom(clientCode) != null) {
					CardPlayerHttpClient c = (CardPlayerHttpClient) GameRoom.getRoom(clientCode).getSessions().get(player);
					if (c != null) {
						c.openSubscription (exchange);
						response = "";
					}
				}
				return response;
			}
			log ("SERVER: %s %s Event from player %s.", clientCode, clz, player);
			if (e instanceof CardEventPlayerRegister) {
				String status = "OK";
				String m = "";
				GameRoom room = GameRoom.getRoom(clientCode);
				
				if (clientCode.contentEquals("NEW")) {
					room = GameRoom.createGameRoom ();
					CardGame game = room.getGame();
					game.setUi(this);
					new Thread () {
						public void run () {
							setName ("Game Server Thread:" + clientCode);
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
					if (!game.isGameOver() && game.getPlayers().size() < room.getNumPlayer()) {
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
					Map<String, CardPlayer> sessions = room.getSessions();
					CardPlayerHttpClient c = (CardPlayerHttpClient) sessions.get(player);
					m = "Wecome back!";
					if (c == null) {
						c = new CardPlayerHttpClient (player, room.getCode());
						synchronized (sessions) {
							if (sessions.size() < room.getNumPlayer()) {
								c.setPosition (sessions.size());
								sessions.put(player, c);
								if (player.startsWith("AI_")) {
									c.setAlgo("sim");
								}
								m = "Welcome!";
								e.setMessage(m);
							}
							else {
								status = "REJECT";
								m = "Sorry, game room is full";
							}
						}
					}
					else {
						m = "Welcome back!";
						e = new CardEventPlayerReconnect (m);
					}
					if (status.contentEquals("OK")) {
						((CardEventPlayerRegister)e).setAllPlayers (sessions.values());
						e.setPlayer(c);
						e.setMessage(m + " - " + player);
						c.handleEvent(this, e);
						if (room.getGame().isGameOver()) {
							c.handleEvent(this, new CardEventGameOver());				
						}
					}
				}
				String code = (room == null ? "" : room.getCode());
				CardEventLoginAck ack = new CardEventLoginAck (e.getPlayer(), code, m + " - " + player, status);
				response = ack.getJsonString();
				log ("SERVER:" + response);
			}
			else if (GameRoom.getRoom(clientCode) != null && GameRoom.getRoom(clientCode).getSessions().containsKey(player)) {
				CardPlayer c = GameRoom.getRoom(clientCode).getSessions().get(player);
				e.setPlayer(c);
				if (e instanceof CardEventPlayerAction) {
					e.setFieldValues (request);
					((CardPlayerHttpClient)c).handleEvent(this, e);
					response = new CardEventGameIdle ("OK").getJsonString();
				}
			}
			else {
				log ("SERVER: Exception Unknown Request - "  + query);
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
		cardGame.gameEvent(new CardEventGameStart ());
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
				int total = ((CardEventWaitForPlayers)request).getNumPlayer();
				room.setNumPlayer(total);
				room.getGame().notifyAll();
			}
			return;
		}
		if (request instanceof CardEventGameOver) {
			cardGame.gameEvent(request);
		}
		if (request.getPlayer() != null) {
			log ("Game Sent: %s %s - %s", room.getCode(), request.getMessage(), request.getPlayer().getName());
			CardPlayer p = request.getPlayer();
			p.handleEvent (this, request);
		}
		else {
			log ("Game Sent: %s %s", room.getCode(), request.getMessage());
			for (CardPlayer p : cardGame.getPlayers()) {
				p.handleEvent (this, request);
			}
		}
	}
	public void playerEvent(CardEvent request) {
		String code = ((CardPlayerHttpClient) request.getPlayer()).getCode();
		GameRoom room = GameRoom.getRoom(code);
		room.getGame().playerEvent(request);
		log ("Client Sent: %s Player Event - %s", room.getCode(), request.getJsonString());
	}
	static public void main (String args[]) {
		new CardHttpServer (8001);
	}
}
