package com.ialogic.games.cards.event;

import java.util.HashMap;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGameRule;
import com.ialogic.games.cards.CardPlayer;

public class CardEvent {
	String message;
	CardPlayer player;
	CardGameRule rule;
	boolean masked=false;

	public CardGameRule getRule() {
		return rule;
	}
	public void setRule (CardGameRule rule) {
		this.rule = rule;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public CardEvent(String message) {
		this.message = message;
	}
	public static CardEvent getEvent(String message) {
		return new CardEvent (message);
	}
	public boolean isMasked() {
		return masked;
	}
	public void setMasked(boolean masked) {
		this.masked = masked;
	}
	public CardPlayer getPlayer() {
		return player;
	}
	public void setPlayer(CardPlayer player) {
		this.player = player;
	}
	public JsonObjectBuilder getJsonObjectBuilder() {
		JsonObjectBuilder builder =  Json.createObjectBuilder()
				.add("event",this.getClass().getSimpleName())
				.add("message", getMessage());
		if (getPlayer () != null) {
			builder.add ("player", getPlayer().getJsonObjectId ());
		}
		if (!masked && getRule () != null) {
			builder.add ("rule", Json.createObjectBuilder()
				.add("reason",  getRule().getExplanation())
				.add("allowed", Card.showCSList(getRule().getAllowed())).build());
		}
		return builder;
	}
	public JsonObject getJsonObject () {
		return getJsonObjectBuilder().build();
	}
	public String getJsonString() {
		return getJsonObject().toString();
	}
	public void setFieldValues(HashMap<String, String> request) {
	}
}
