package com.ialogic.games.cards.event;

import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventEndRound extends CardEvent {
	List<Card>points;
	public CardEventEndRound(CardPlayer winner) {
		super(winner.getName() + " won the round");
		setPlayer(winner);
	}
	public List<Card> getPoints() {
		return points;
	}
	public void setPoints(List<Card> points) {
		this.points = points;
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder = super.getJsonObjectBuilder ();
		builder.add ("points_this_round", Card.showCSList(points));
		return builder.build();
	}
}
