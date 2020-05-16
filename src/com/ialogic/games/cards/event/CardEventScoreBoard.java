package com.ialogic.games.cards.event;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventScoreBoard extends CardEvent {
	ArrayList<String> text = new ArrayList<String>();
	ArrayList<String> points = new ArrayList<String>();
	ArrayList<String> names = new ArrayList<String>();
	String faceups = "";
	public CardEventScoreBoard(String message) {
		super(message);
	}

	public void addLine(String ps) {
		text.add(ps);
	}
	public void setPoints(List<CardPlayer> players) {
		for (CardPlayer p : players) {
			String pts = "";
			if (p.getPoints() != null) {
				pts = Card.showCSList(Card.sort(p.getPoints()));
			}
			names.add(p.getName());
			points.add(pts);
		}
	}
	public void setFaceups(ConcurrentHashMap<CardPlayer, List<Card>> faceUps) {
		ArrayList<Card> cards = new ArrayList<Card>();
		for (List<Card> l : faceUps.values()) {
			cards.addAll(l);
		}
		faceups = Card.showCSList(cards);
	}
	public JsonObject getJsonObject () {
		JsonObjectBuilder builder =  super.getJsonObjectBuilder();
		JsonArrayBuilder ab = Json.createArrayBuilder();
		for (int i = 0; i < names.size(); ++i) {
			ab.add(Json.createObjectBuilder()
				.add("name", names.get(i))
				.add("points", points.get(i)).build());
		}
		builder.add("player_list", ab.build());
		JsonArrayBuilder lb = Json.createArrayBuilder();
		for (String line : text) {
			lb.add(line);
		}
		builder.add("lines", lb.build());
		builder.add("faceup", faceups);
		return builder.build();
	}	
}