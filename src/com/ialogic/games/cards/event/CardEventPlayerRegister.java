package com.ialogic.games.cards.event;

import java.util.Collection;
import java.util.Iterator;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerRegister extends CardEvent {
	Collection<CardPlayer>  allPlayers;
	public CardEventPlayerRegister(String name) {
		super(name);
	}
	public void setAllPlayers(Collection<CardPlayer> values) {
		allPlayers = values;
	}
	public Collection<CardPlayer> getAllPlayers() {
		return allPlayers;
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		JsonArrayBuilder ab = Json.createArrayBuilder();
		for (Iterator<CardPlayer> i = allPlayers.iterator(); i.hasNext();) {
			CardPlayer p = i.next();
			ab = ab.add(player.getJsonObjectId());
		}
		builder.add("player_list", ab);
		return builder.build();
	}
}
