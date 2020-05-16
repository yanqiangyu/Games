package com.ialogic.games.cards.event;

import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.CardPlayer;
public class CardEventLoginAck extends CardEvent {
	String status;
	String code;
	public CardEventLoginAck(CardPlayer player, String c, String m, String s) {
		super(m);
		setPlayer (player);
		setStatus (s);
		setCode(c);
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		builder.add ("status", getStatus());
		builder.add ("new_code", getCode());
		return builder.build();
	}
}
