package com.ialogic.games.cards.server;

import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventTurnToPlay;

public class CardPlayerHttpClient extends CardPlayer {
	String code;
	LinkedBlockingQueue<CardEvent> events = new LinkedBlockingQueue<CardEvent>();
	
	public CardPlayerHttpClient (String name, String code) {
		setName (name);
		this.code = code;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		if (request.getPlayer() == this) {
			if (request instanceof CardEventPlayerRegister) {
				ui.playerEvent(request);
				events.add (request);
			}
			else if (request instanceof CardEventFaceUpResponse) {
				String cards = ((CardEventFaceUpResponse) request).getCards();
				faceupCards (cards);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventPlayerAction) {
				String card = ((CardEventPlayerAction) request).getCardPlayed();
				playCard (card);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventEndRound) {
				getPoints().addAll(((CardEventEndRound)request).getPoints());
				ui.playerEvent(request);
				events.add (request);
			}
			else if (request instanceof CardEventTurnToPlay) {
				ui.playerEvent(request);
				events.add (request);
			}
			else {
				events.add (request);
			}
		}
		else {
			events.add (request);
		}
	}
	public String getGameState() {
		return null;
	}
	public String getEventFromQueue() {
		String response = 
				"<event name='CardEventGameIdle'>" +
				"<message>Code:" + code +"</message>" +
				"</event>";
		if (!events.isEmpty()) {
			CardEvent e= events.remove ();
			response = e.getXMLString (); 
			System.out.println ("Sent to:[" + getName() + "]" + response);
		}
		return response;
	}
}
