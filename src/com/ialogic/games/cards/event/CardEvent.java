package com.ialogic.games.cards.event;

import java.util.HashMap;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;

public class CardEvent {
	String message;
	CardPlayer player;
	
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
	public CardPlayer getPlayer() {
		return player;
	}
	public void setPlayer(CardPlayer player) {
		this.player = player;
	}
	public String getXMLString() {
		String  p = "";
		if (getPlayer() != null ) {
			p = String.format("<player name='%s' position='%s'/>", getPlayer().getName(), getPlayer().getPosition());
		}
		String response = String.format("<event name='%s'><message>%s</message>%s</event>",
				this.getClass().getSimpleName(), getMessage(), p);
		return response;
	}
	public String getJsonString() {
		return getJsonObject().toString();
	}
	public JsonObject getJsonObject () {
		
		JsonObjectBuilder builder =  Json.createObjectBuilder()
				.add("event",this.getClass().getSimpleName())
				.add("message", getMessage());
		if (getPlayer () != null) {
			JsonArray players = Json.createArrayBuilder()
				     .add(getPlayer().getJsonObject()).build();
			builder.add ("players", players);
		}
		return builder.build();
	}
	public void setFieldValues(HashMap<String, String> request) {
	}
}
