package com.ialogic.games.cards.event;

import java.util.HashMap;
import com.ialogic.games.cards.CardPlayer;

public class CardEventFaceUpResponse extends CardEvent {
	String cards;
	public CardEventFaceUpResponse (String message) {
		super (message);
	}
	public String getCards() {
		return cards;
	}

	public void setCards(String cards) {
		this.cards = cards;
	}

	public CardEventFaceUpResponse(CardPlayer p) {
		super("No card to face up");
		setPlayer (p);
	}
	public void setFieldValues(HashMap<String, String> request) {
		cards = request.get("cards");
		if (cards.isEmpty() || cards.isBlank()) {
			cards="NA";
		}
	}
	public String getXMLString() {
		String response = String.format("<event name='%s'><message>%s</message><player name='%s'/><faceup>%s</faceup><event>",
				this.getClass().getSimpleName(), getMessage(), getPlayer().getName(), cards);
		return response;
	}
}
