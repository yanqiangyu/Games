package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerAction extends CardEvent {
	public CardEventPlayerAction(String message) {
		super(message);
	}
	public CardEventPlayerAction(CardPlayer p) {
		super("Turn played");
		setPlayer (p);
	}
}
