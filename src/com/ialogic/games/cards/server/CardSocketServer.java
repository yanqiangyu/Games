package com.ialogic.games.cards.server;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.PigChase;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventGameIdle;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.ui.CardUI;

public class CardSocketServer implements CardUI {
	Queue<CardEvent>events = new LinkedBlockingQueue<CardEvent> ();
	List<CardPlayerClient> sessions = new ArrayList<CardPlayerClient>();
	public CardSocketServer (final int port){
		new Thread () {
			public void run () {
			try {
				ServerSocket s = new ServerSocket (port);
				System.out.println(String.format ("Port %d ready", port));
				
				while (s.isBound()) {
					Socket client = s.accept();
					CardPlayerClient c = new CardPlayerClient (client, CardSocketServer.this );
					String name = "Player " + (sessions.size() + 1); 
					c.setName(name);
					sessions.add(c);
					System.out.println(String.format ("New Client %s", c.getName()));
				}
				s.close();
			}
			catch (IOException e) {
				System.out.println(String.format ("Port %d error : %s", port, e.getMessage()));
				System.exit(0);
			}
		}}.start();;
	}
	public void showText(String text) {
		for (CardPlayerClient c : sessions) {
			c.handleEvent(this, new CardEventGameIdle (text));
		}
	}
	public void open(CardGame cardGame) {
		addEvent(new CardEventGameStart ());
		System.out.println(String.format ("Game %s Started.", cardGame.getName()));
		showText ("Welcome to a game of \"" + cardGame.getName() + "\"!");
	}

	public void close(CardGame cardGame) {
		showText ("Good bye!");
		System.exit(0);
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
		for (CardPlayer p : sessions) {
			Card c= p.getCardPlayed();
			String faceUp = Card.showList (p.getFaceup());
			String points = Card.showList (p.getPoints());
			String card = (c == null ? "()" : c.toString());
			String line = String.format("%12s -> %4s |%-20s |%s", 
					p.displayString (),
					card, 
					faceUp, 
					points);
			showText (line);
		}
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
		CardSocketServer server = new CardSocketServer (8080);
		game.setUi(server);
		game.play ();
	}
}
