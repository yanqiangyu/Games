package com.ialogic.games.cards.terminal;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGameRule;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.Card.Suits;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventDealCards;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventTurnToPlay;

public class CardPlayerDummy extends CardPlayer {
	public void handleEvent (CardUI ui, CardEvent request) {
		if (request instanceof CardEventDealCards) {
			String debug = String.format("%12s %s", 
					displayString (),
					Card.showList(getHand()));
			ui.showText(debug);
		}
		else if (request instanceof CardEventFaceUp) {
			CardEventFaceUpResponse e = new CardEventFaceUpResponse (this);
			for (Card c : getHand ()) {
				if (c.isSpecial() && countSuit (c.getSuit()) > 4) {
					getFaceup().add(c);
				}
			}
			e.setCards(getFaceup());
			ui.playerEvent (e);
		}
		else if (request instanceof CardEventTurnToPlay) {
			CardGameRule r = ((CardEventTurnToPlay) request).getRule();
			String debug = String.format("%12s %20s %s", 
					displayString (),
					r.getExplanation(),
					Card.showList(r.getAllowed()));
					
			ui.showText(debug);
			if (r.getAllowed().size() > 0) {
				int n = (int) (Math.random() * (double) r.getAllowed().size());
				Card c = r.getAllowed().remove(n);
				getHand ().remove(c);
				getFaceup().remove(c);
				setCardPlayed (c);
			}
			ui.playerEvent (new CardEventPlayerAction (this));
		}
		else if (request instanceof CardEventEndRound) {
			getPoints().addAll(((CardEventEndRound)request).getPoints());
			String debug = String.format("%12s won this round %s", 
					displayString (),
					Card.showList(((CardEventEndRound)request).getPoints()));
			ui.showText(debug);
		}
	}
	private int countSuit(Suits suit) {
		int count = 0;
		for (Card c : getHand()) {
			if (c.getSuit() == suit) {
				++count;
			}
		}
		return count;
	}
}
