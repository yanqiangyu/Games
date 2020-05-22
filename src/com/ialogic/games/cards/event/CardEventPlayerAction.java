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
	public void setCardPlayed(String cardPlayed) {
		this.cardPlayed = cardPlayed;
	}
	public void setFieldValues(HashMap<String, String> request) {
		cardPlayed = request.get("cards");
		setMessage (String.format("Player '%s' played '%s'", 
				getPlayer().getName(),
				cardPlayed));
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		if (cardPlayed != null) {
			builder.add ("card_played", cardPlayed);
		}
		return builder.build();
	}
}
