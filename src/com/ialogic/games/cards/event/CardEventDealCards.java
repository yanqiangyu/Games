package com.ialogic.games.cards.event;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;

public class CardEventDealCards extends CardEvent {
	public CardEventDealCards(CardPlayer p) {
		super("Card Dealt");
		setPlayer (p);
	}
	public JsonObjectBuilder getJsonObjectBuilder() {
		JsonObjectBuilder builder =  Json.createObjectBuilder()
				.add("event",this.getClass().getSimpleName())
				.add("message", getMessage());
		if (getPlayer () != null) {
			builder.add ("player", getPlayer().getJsonObject (false));
		}
		return builder;
	}
}
