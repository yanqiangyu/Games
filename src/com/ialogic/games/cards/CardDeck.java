package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.Arrays;
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
		for (int i = n - 1; i > 0; --i) {
			int r = (int) (Math.random () * i);
			Card c = cards.get(i);
			cards.set(i, cards.get(r));
			cards.set(r, c);
		}
	}
	public void manualShuffle() {
		int n = cards.size();
		for (int t = 0; t < 3; ++t) {
			ArrayList<Card> s = new ArrayList<Card>();
			int cut = (int) (40 + Math.random()*10);
			int c = cut;
			for (int i = 0; i < cut; ++i) {
				s.add(cards.get(i));
				if (c < n) {
					if (Math.random() > 0.2) {
						s.add(cards.get(c));
						++c;
					}
				}
			}
			for (; c<n; ++c) {
				s.add(cards.get(c));
			}
			cards = s;
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
	static public void main (String args[]) {
		ArrayList<CardPlayer> players = new ArrayList<CardPlayer>();
		for (int i=0; i < 4; ++i) {
			players.add(new CardPlayerAI("A" + i));
		}
		CardDeck d = new CardDeck (52);
		for (int h = 0; h < 100; ++h) {
			d.manualShuffle ();
			d.deal(players);
			for (int i=0; i < 4; ++i) {
				int dist[] = new int [] {
					players.get(i).countSuit(Card.Suits.CLUBS),
					players.get(i).countSuit(Card.Suits.DIAMONDS),
					players.get(i).countSuit(Card.Suits.HEARTS),
					players.get(i).countSuit(Card.Suits.SPADES)
				};
				Arrays.sort(dist);
				int k = dist[0] + dist[1]*10 + dist[2]*100 + dist[3]*1000;
				System.out.println (k);
			}
		}
	}
}
