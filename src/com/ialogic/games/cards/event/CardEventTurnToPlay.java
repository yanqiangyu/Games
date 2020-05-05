package com.ialogic.games.cards.event;

import com.ialogic.games.cards.Card;
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
	public String getXMLString() {
		String  r = "";
		if (rule != null) {
			r = String.format("reason='%s' allowed='%s'", 
					rule.getExplanation(), 
					Card.showCSList(rule.getAllowed()));
		}
		String response = String.format("<event name='%s'><message>%s</message><player name='%s'/><rule %s/></event>",
				this.getClass().getSimpleName(), getMessage(), getPlayer().getName(), r);
		return response;
	}
}
