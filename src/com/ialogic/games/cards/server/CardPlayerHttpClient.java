package com.ialogic.games.cards.server;

import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;

public class CardPlayerHttpClient extends CardPlayer {
	CardUI server;
	LinkedBlockingQueue<CardEvent> events = new LinkedBlockingQueue<CardEvent>();
	
	public CardPlayerHttpClient (String name, CardUI svr) {
		setName (name);
		server = svr;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		events.add (request);
	}
	public String getGameState() {
		return null;
	}
	public String getEventFromQueue() {
		String response = 
				"<event name='CardEventGameIdle'>" +
				"<message>Please Wait</message>" +
				"</event>";
		if (!events.isEmpty()) {
			CardEvent e= events.remove ();
			response = e.getXMLString (); 
			System.out.println ("Sent:" + response);
		}
		return response;
	}
}
