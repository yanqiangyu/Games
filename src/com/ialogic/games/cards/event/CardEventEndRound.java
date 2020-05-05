package com.ialogic.games.cards.event;

import java.util.List;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventEndRound extends CardEvent {
	List<Card>points;
	public CardEventEndRound(CardPlayer winner) {
		super("Winning the round");
		setPlayer(winner);
	}
	public List<Card> getPoints() {
		return points;
	}
	public void setPoints(List<Card> points) {
		this.points = points;
	}
	public String getXMLString() {
		String cards = "";
		String sep = "";
		for (Card c : points) {
			cards += sep + c.getRank().toString() + c.getSuit().toString();
			sep = ",";
		}
		String response = String.format("<event name='%s'><message>%s</message><player name='%s' points='%s'/></event>",
				this.getClass().getSimpleName(), getMessage(), getPlayer().getName(), cards);
		return response;
	}
}
