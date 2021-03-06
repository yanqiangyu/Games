package com.ialogic.games.cards.server;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.PigChase;

public class GameRoom {
	static private ConcurrentHashMap<String, GameRoom>rooms = new ConcurrentHashMap<String, GameRoom>();
	static private ConcurrentHashMap<CardGame, GameRoom>gameIndex = new ConcurrentHashMap<CardGame, GameRoom>();
	private CardGame game;
	private String code="";
	private Map<String, CardPlayer> sessions = new ConcurrentHashMap <String, CardPlayer> ();
	private int numPlayer;
	public GameRoom () {
		game = new PigChase();
		sessions.clear();
		do {
			code = String.format("%04d", (int) (Math.random() * 10000));
		} while (rooms.containsKey(code));
	}
	public static GameRoom createGameRoom () {
		GameRoom room = new GameRoom ();
		rooms.put (room.getCode(), room);
		gameIndex.put (room.getGame(), room);
		return room;
	}
	public CardGame getGame() {
		return game;
	}
	public void setGame(CardGame game) {
		this.game = game;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public Map<String, CardPlayer> getSessions() {
		return sessions;
	}
	public void setSessions(HashMap<String, CardPlayer> sessions) {
		this.sessions = sessions;
	}
	public static GameRoom getRoom (String code) {
		return rooms.get(code);
	}
	public static void closeRoom (String code) {
		GameRoom room = rooms.remove (code);
		gameIndex.remove(room.getGame());
	}
	public static GameRoom findRoom(CardGame cardGame) {
		return gameIndex.get (cardGame);
	}
	public void setNumPlayer(int total) {
		numPlayer = total;
	}
	public int getNumPlayer() {
		return numPlayer;
	}
}
