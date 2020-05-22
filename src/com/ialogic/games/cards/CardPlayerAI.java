package com.ialogic.games.cards;

import java.util.List;
import java.util.ArrayList;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventTurnToPlay;

public class CardPlayerAI extends CardPlayer {
	public CardPlayerAI() {
		super ();
	}
	public CardPlayerAI(String name) {
		super ();
		setName (name);
	}
	@Override
	public void handleEvent (CardUI ui, CardEvent request) {
		memorizeEvent(request);
		if (request instanceof CardEventFaceUp) {
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
		}
		else if (request instanceof CardEventTurnToPlay) {
			CardGameRule r = ((CardEventTurnToPlay) request).getRule();
			if (r.getAllowed().size() > 0) {
				int n = 0;
				if (getAlgo ().contentEquals("sim")) {
					CardGameSimulation sim = new CardGameSimulation();
					memory.currentHand = Card.showCSList (getHand());
					memory.allowed = Card.showCSList(r.getAllowed());
					n = sim.getRecommendation (memory, 100);
				}
				else if (getAlgo ().contentEquals("random")) {
					n = (int) (Math.random() * (double) r.getAllowed().size());
				}
				String c = r.getAllowed().get(n).toString().substring(1,3);
				CardEventPlayerAction e = new CardEventPlayerAction (this);
				e.setCardPlayed(c);
				memorizeEvent (e);
				ui.playerEvent (e);
			}
			else {
				System.out.println ("Exception: " + getName() + " no card allowed:" + Card.showCSList(getHand())); 
			}
		}
		else if (request instanceof CardEventEndRound) {
			if (request.getPlayer() == this) {
				ui.playerEvent(request);
			}
		}
	}
}
