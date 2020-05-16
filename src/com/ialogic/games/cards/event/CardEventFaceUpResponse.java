package com.ialogic.games.cards.event;

import java.util.HashMap;

import com.ialogic.games.cards.CardPlayer;

public class CardEventFaceUpResponse extends CardEventPlayerAction {
	public CardEventFaceUpResponse (String message) {
		super (message);
	}
	public CardEventFaceUpResponse(CardPlayer p) {
		super("No card to face up");
		setPlayer (p);
	}
	public void setFieldValues(HashMap<String, String> request) {
		String cards = request.get("cards");
		if (cards.isEmpty()) {
			cards="NA";
		}
		request.put("cards", cards);
		super.setFieldValues(request);
	}
}
