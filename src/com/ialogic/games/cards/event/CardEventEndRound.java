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
}
