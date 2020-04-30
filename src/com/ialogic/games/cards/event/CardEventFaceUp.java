package com.ialogic.games.cards.event;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventFaceUp extends CardEvent {

	public CardEventFaceUp() {
		super("Declare Face Up Cards");
	}
	public String getXMLString() {
		String response = String.format("<event name='%s'>" +
				"<message>Choose Cards or Pass</message>" +
				"<rule reason='Special card only' allowed='AH,QS,XC,JD'/></event>",
				this.getClass().getSimpleName());
		return response;
	}
}
