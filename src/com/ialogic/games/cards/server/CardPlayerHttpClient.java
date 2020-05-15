package com.ialogic.games.cards.server;

import java.util.concurrent.LinkedBlockingQueue;

import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

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
	LinkedBlockingQueue<CardEvent> notificationQueue = new LinkedBlockingQueue<CardEvent>();
	private CardEvent pendingInput = null;
	
	public CardPlayerHttpClient (String name, String code) {
		setName (name);
		this.code = code;
	}
	public String getCode() {
		return code;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		if (request.getPlayer() == this) {
			if (request instanceof CardEventPlayerReconnect) {
				notificationQueue.clear();
				addNotification (request);
				CardEvent p = getPendingInput ();
				if (p != null) {
					addNotification (pendingInput);
				}
			}
			else if (request instanceof CardEventPlayerRegister) {
				ui.playerEvent(request);
				addNotification (request);
			}
			else if (request instanceof CardEventFaceUpResponse) {
				setPendingInput (null);
				String cards = ((CardEventFaceUpResponse) request).getCards();
				faceupCards (cards);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventPlayerAction) {
				setPendingInput (null);
				String card = ((CardEventPlayerAction) request).getCardPlayed();
				playCard (card);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventEndRound) {
				getPoints().addAll(((CardEventEndRound)request).getPoints());
				ui.playerEvent(request);
				addNotification (request);
			}
			else if (request instanceof CardEventTurnToPlay) {
				CardEventTurnToPlay masked = new CardEventTurnToPlay (request.getPlayer());
				ui.playerEvent(masked);
				setPendingInput (request);
				addNotification (request);
			}
			else {
				addNotification (request);
			}
		}
		else {
			if (request instanceof CardEventFaceUp) {
				setPendingInput (request);
			}
			addNotification (request);
		}
	}
	private void addNotification(CardEvent request) {
		notificationQueue.add(request);
		// TODO: post request;
	}
	private synchronized void setPendingInput (CardEvent e) {
		pendingInput = e;
	}
	private synchronized CardEvent getPendingInput () {
		return pendingInput;
	}
	public String getEventFromQueue() {
		String response = ""; 
		if (!notificationQueue.isEmpty()) {
			CardEvent e= notificationQueue.poll ();
			response = e.getXMLString (); 
			System.out.println ("Sent to: " + code + " [" + getName() + "]" + response);
			System.out.println ("****NEXT STEP: " + code + " [" + getName() + "]" + e.getJsonString());
		}
		return response;
	}
	@Override
	public JsonValue getJsonObject() {
		JsonValue obj =  super.getJsonObject();
		if (getCode () != null) {
			JsonObjectBuilder builder = Json.createObjectBuilder();
			for (String k : obj.asJsonObject().keySet()) {
				builder.add(k, obj.asJsonObject().get(k));
			}
			builder.add("code", getCode());
			obj = builder.build();
		}
		return obj;
	}
	
}
