package com.ialogic.games.cards.event;

import java.util.HashMap;

import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerAction extends CardEvent {
	String cardPlayed;
	public CardEventPlayerAction(String message) {
		super(message);
	}
	public CardEventPlayerAction(CardPlayer p) {
		super("Turn played");
		setPlayer (p);
	}
	public String getCardPlayed() {
		return cardPlayed;
	}
	public void setCardPlayed (String card) {
		this.cardPlayed = card;
		setMessage (String.format("%s played [%s]", 
				getPlayer().getName(),
				cardPlayed));
	}
	public void setFieldValues(HashMap<String, String> request) {
		String card = request.get("cards");
		setCardPlayed (card);
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		if (cardPlayed != null) {
			builder.add ("card_played", cardPlayed);
		}
		return builder.build();
	}
}
