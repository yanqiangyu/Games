package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardPlayer;

public class CardEventDealCards extends CardEvent {
	public CardEventDealCards(CardPlayer p) {
		super("Card Dealt");
		setPlayer (p);
	}
}
