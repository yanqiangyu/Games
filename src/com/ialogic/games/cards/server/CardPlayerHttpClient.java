package com.ialogic.games.cards.server;

import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;

public class CardPlayerHttpClient extends CardPlayer {
	CardUI server;
	int position;
	LinkedBlockingQueue<CardEvent> events = new LinkedBlockingQueue<CardEvent>();
	
	public CardPlayerHttpClient (String name, CardUI svr) {
		setName (name);
		server = svr;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		String debug = String.format("%12s %s", 
				displayString (),
				Card.showList(getHand()));
		System.out.println (debug);
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
	public void setPosition(int i) {
		this.position = i;
	}
	public int getPosition() {
		return this.position;
	}
}
