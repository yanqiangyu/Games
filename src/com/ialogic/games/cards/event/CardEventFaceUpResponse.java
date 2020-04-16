package com.ialogic.games.cards.event;
import java.util.List;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

import java.util.ArrayList;

public class CardEventFaceUpResponse extends CardEvent {
	List<Card>cards = new ArrayList<Card>();

	public List<Card> getCards() {
		return cards;
	}

	public void setCards(List<Card> cards) {
		this.cards = cards;
	}

	public CardEventFaceUpResponse(CardPlayer p) {
		super("No card to face up");
		setPlayer (p);
	}
}
