package com.ialogic.games.cards.event;

import java.util.ArrayList;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGameRule;

public class CardEventFaceUp extends CardEventTurnToPlay {
	public CardEventFaceUp() {
		super("Declare Face Up Cards");
		CardGameRule rule = new CardGameRule();
		rule.setExplanation("Special card only");
		rule.setAllowed(new ArrayList<Card>());
		rule.getAllowed().add(new Card("AH"));
		rule.getAllowed().add(new Card("QS"));
		rule.getAllowed().add(new Card("XC"));
		rule.getAllowed().add(new Card("JD"));
		setRule (rule);
	}
}
