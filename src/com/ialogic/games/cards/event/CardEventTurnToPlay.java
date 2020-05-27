package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardPlayer;

public class CardEventTurnToPlay extends CardEvent {
	public CardEventTurnToPlay(String m) {
		super(m);
	}
	public CardEventTurnToPlay(CardPlayer p) {
		super(String.format("%s turn to play", p.getName()));
		setPlayer (p);
	}
}
