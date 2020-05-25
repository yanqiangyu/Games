package com.ialogic.games.cards.server;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.LinkedBlockingQueue;

import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGameRule;
import com.ialogic.games.cards.CardGameSimulation;
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
		memorizeEvent(request);
		if (request.getPlayer() == this) {
			if (request instanceof CardEventPlayerReconnect) {
				notificationQueue.clear();
				if (getScoreBoard() != null) {
					addNotification (getScoreBoard());
				}
				addNotification (request);
				if (getPendingInput () != null) {
					addNotification (getPendingInput ());
				}
			}
			else if (request instanceof CardEventPlayerRegister) {
				addNotification (request);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventPlayerAction) {
				setPendingInput (null);
				ui.playerEvent(request);
			}
			else if (request instanceof CardEventEndRound) {
				ui.playerEvent(request);
				addNotification (request);
			}
			else if (request instanceof CardEventTurnToPlay) {
				CardEventTurnToPlay masked = new CardEventTurnToPlay (request.getPlayer());
				masked.setMasked(true);
				ui.playerEvent(masked);
				if (getAlgo ().contentEquals("sim")) {
					CardGameRule r = ((CardEventTurnToPlay) request).getRule();
					CardGameSimulation sim = new CardGameSimulation();
					getMemory().currentHand = Card.showCSList (getHand());
					getMemory().allowed = Card.showCSList(r.getAllowed());
					ui.showText (getName() + " running Simmulation");
					int n = sim.getRecommendation (getMemory(), 100);
					ui.showText (getName() + " simulation completed.");
					String c = r.getAllowed().get(n).toString().substring(1,3);
					CardEventPlayerAction e = new CardEventPlayerAction (this);
					e.setCardPlayed(c);
					memorizeEvent (e);
					ui.playerEvent (e);
					addNotification (e);
				}
				else {
					setPendingInput (request);
					addNotification (request);
				}
			}
			else {
				addNotification (request);
			}
		}
		else {
			if (request instanceof CardEventFaceUp) {
				if (getAlgo ().contentEquals("sim")) {
					CardEventFaceUpResponse e = new CardEventFaceUpResponse (this);
					List<Card> f = new ArrayList<Card>();
					for (Card c : getHand ()) {
						if (c.isSpecial() && countSuit (c.getSuit()) > 4) {
							f.add(c);
						}
					}
					e.setCardPlayed(Card.showCSList(f));
					memorizeEvent (e);
					ui.playerEvent (e);
					addNotification (e);
				}
				else {
					setPendingInput (request);
					addNotification (request);
				}
			}
			else {
				addNotification (request);
			}
		}
	}
	private void addNotification(CardEvent request) {
		notificationQueue.add(request);
		// TODO: notifyAll();
	}
	private synchronized void setPendingInput (CardEvent e) {
		pendingInput = e;
	}
	private synchronized CardEvent getPendingInput () {
		return pendingInput;
	}
	public String getNotification () {
		String response = ""; 
		if (!notificationQueue.isEmpty()) {
			CardEvent e= notificationQueue.poll ();
			response = e.getJsonString (); 
			System.out.println ("Sent to: " + code + " [" + getName() + "]" + response);
		}
		return response;
	}
	@Override
	public JsonValue getJsonObject(boolean masked) {
		JsonValue obj =  super.getJsonObject(masked);
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
