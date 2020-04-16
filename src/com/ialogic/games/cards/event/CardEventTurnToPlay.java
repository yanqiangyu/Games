package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardGameRule;
import com.ialogic.games.cards.CardPlayer;

public class CardEventTurnToPlay extends CardEvent {
	CardGameRule rule;
	
	public CardEventTurnToPlay(CardPlayer p) {
		super("Turn to play");
		setPlayer (p);
	}
	public CardGameRule getRule() {
		return rule;
	}
	public void setRule (CardGameRule rule) {
		this.rule = rule;
	}
}
