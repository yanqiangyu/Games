package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.List;

public class CardDeck {
	ArrayList<Card> cards;
	ArrayList<Card> played;
	public CardDeck(int n) {
		cards = new ArrayList<Card>();
		played = new ArrayList<Card>(0);
		for (Card.Suits s : Card.Suits.values()) {
			for (Card.Ranks r : Card.Ranks.values()) {
				Card c = new Card(s,r);
				cards.add(c);
			}
		}
	}
	public List<Card> cards () {
		return cards;
	}
	public List<Card> played () {
		return played;
	}
	public int size () {
		return cards.size();
	}
	public void shuffle() {
		int n = cards.size();
		int h = n / 2;
		for (int s = 0; s < 5; ++s) {
			for (int i = 0; i < h; ++i) {
				int d = h + (int) (Math.random() * (double) h);
				Card c = cards.get (i);
				cards.set(i, cards.get(d));
				cards.set(d,c);
			}
		}
	}
	public void deal(List<CardPlayer> players) {
		int top = 0;
		for (CardPlayer p : players) {
			p.getHand().clear();
			p.getFaceup().clear();
			p.getPoints().clear();
			p.getTricks().clear();
			p.setCardPlayed(null);
		}
		while (top < cards.size()) {
			for (int i = 0; i < players.size (); ++i) {
				Card c = cards.get(top);
				players.get(i).getHand().add(c);
				++top;
			}
		}
		for (CardPlayer p : players) {
			Card.sort(p.getHand());
		}
		
	}
}
