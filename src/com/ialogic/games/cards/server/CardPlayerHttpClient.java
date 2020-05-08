package com.ialogic.games.cards.server;

import java.util.concurrent.LinkedBlockingQueue;

import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerReconnect;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventTurnToPlay;

public class CardPlayerHttpClient extends CardPlayer {
	String code;
	LinkedBlockingQueue<CardEvent> events = new LinkedBlockingQueue<CardEvent>();
	CardEvent pendingInput = null;
	
	public CardPlayerHttpClient (String name, String code) {
		setName (name);
		this.code = code;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		if (request.getPlayer() == this) {
			if (request instanceof CardEventPlayerReconnect) {
				events.clear();
				addRequest (request);
				if (pendingInput != null) {
					addRequest (pendingInput);
				}
			}
			else if (request instanceof CardEventPlayerRegister) {
				ui.playerEvent(request);
				addRequest (request);
			}
			else if (request instanceof CardEventFaceUpResponse) {
				pendingInput = null;
				String cards = ((CardEventFaceUpResponse) request).getCards();
				faceupCards (cards);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventPlayerAction) {
				pendingInput = null;
				String card = ((CardEventPlayerAction) request).getCardPlayed();
				playCard (card);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventEndRound) {
				getPoints().addAll(((CardEventEndRound)request).getPoints());
				ui.playerEvent(request);
				addRequest (request);
			}
			else if (request instanceof CardEventTurnToPlay) {
				ui.playerEvent(request);
				pendingInput = request;
				addRequest (request);
			}
			else {
				addRequest (request);
			}
		}
		else {
			if (request instanceof CardEventFaceUp) {
				pendingInput = request;
			}
			addRequest (request);
		}
	}
	private void addRequest(CardEvent request) {
		events.add(request);
	}
	public String getEventFromQueue() {
		String response = 
				"<event name='CardEventGameIdle'>" +
				"<message>Code:" + code +"</message>" +
				"</event>";
		if (!events.isEmpty()) {
			CardEvent e= events.poll ();
			response = e.getXMLString (); 
			System.out.println ("Sent to:[" + getName() + "]" + response);
		}
		return response;
	}
}
