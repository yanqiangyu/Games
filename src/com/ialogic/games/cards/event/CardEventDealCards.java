package com.ialogic.games.cards.event;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventDealCards extends CardEvent {
	public CardEventDealCards(CardPlayer p) {
		super("Card Dealt");
		setPlayer (p);
	}
	public String getXMLString() {
		CardPlayer p = getPlayer();
		String response = String.format("<event name='%s' position='0'><message>%s</message><player name='%s'><hand>%s</hand></player><event>",
				this.getClass().getSimpleName(), getMessage(), p.getName(),Card.showCSList(p.getHand()));
		return response;
	}
}
