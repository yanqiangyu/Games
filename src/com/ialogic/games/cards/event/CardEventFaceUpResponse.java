package com.ialogic.games.cards.event;
import java.util.List;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.Card.Ranks;
import com.ialogic.games.cards.Card.Suits;
import com.ialogic.games.cards.CardPlayer;

import java.util.ArrayList;
import java.util.HashMap;

public class CardEventFaceUpResponse extends CardEvent {
	List<Card>cards = new ArrayList<Card>();
	public CardEventFaceUpResponse (String message) {
		super (message);
	}
	public List<Card> getCards() {
		return cards;
	}

	public void setCards(List<Card> cards) {
		this.cards = cards;
	}

	public CardEventFaceUpResponse(CardPlayer p) {
		super("No card to face up");
		setPlayer (p);
	}
	public void setFieldValues(HashMap<String, String> request) {
		String cs[] = request.get("cards").split(",");
		for (String c : cs) {
			try {
				getCards().add(new Card(c));
			}
			catch (Exception e) {
			}
		}
	}
	public String getXMLString() {
		String  cards = "";
		if (getCards().size() > 0) {
			String sep = "";
			for (Card c : getCards()) {
				cards += sep + c.getRank().toString() + c.getSuit().toString();
				sep = ",";
			}
		}
		else {
			cards="NA";
		}
		String response = String.format("<event name='%s'><message>%s</message><player name='%s'/><faceup>%s</faceup><event>",
				this.getClass().getSimpleName(), getMessage(), getPlayer().getName(), cards);
		return response;
	}
}
