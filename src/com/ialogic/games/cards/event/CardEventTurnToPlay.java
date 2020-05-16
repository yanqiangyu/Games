package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardPlayer;

public class CardEventTurnToPlay extends CardEvent {
	public CardEventTurnToPlay(String m) {
		super(m);
	}
	public CardEventTurnToPlay(CardPlayer p) {
		super("Turn to play");
		setPlayer (p);
	}
}
