package com.ialogic.games.cards.event;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

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
	public String getXMLString() {
		String response = String.format("<event name='%s'><message>%s</message>\n",
				this.getClass().getSimpleName(), getMessage());
		for (int i = 0; i < names.size(); ++i) {
			response += String.format("<player name='%s' points='%s' />\n", names.get(i), points.get(i));
		}
		for (String line : text) {
			response +=String.format ("<line>%s</line>\n", line);
		}
		response += String.format ("<faceup>%s</faceup>\n", faceups);
		response += "</event>";
		return response;
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
}
