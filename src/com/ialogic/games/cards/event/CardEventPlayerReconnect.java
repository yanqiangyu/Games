package com.ialogic.games.cards.event;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerReconnect extends CardEventPlayerRegister {
	public CardEventPlayerReconnect(String message) {
		super(message);
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		JsonArrayBuilder ab = Json.createArrayBuilder();
		for (CardPlayer player : allPlayers) {
			boolean masked = player != getPlayer();
			ab = ab.add(player.getJsonObject (masked));
		}
		builder.add("player_list", ab);
		return builder.build();
	}
}
