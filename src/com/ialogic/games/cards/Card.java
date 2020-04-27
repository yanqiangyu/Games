package com.ialogic.games.cards;

import java.util.Comparator;
import java.util.List;

public class Card implements Comparable<Card>{
	public enum Suits {
		CLUBS("C"),
		DIAMONDS("D"),
		HEARTS("H"),
		SPADES("S");
		
		String face;
		Suits(String f) {
			this.face = f;
		}
		public String toString () {
			return face;
		}
	}
	public enum Ranks {
		TWO("2"),
		THREE("3"),
		FOUR("4"),
		FIVE("5"),
		SIX("6"),
		SEVEN("7"),
		EIGHT("8"),
		NINE("9"),
		TEN("X"),
		JACK("J"),
		QUEEN("Q"),
		KING("K"),
		ACE("A");
		String face;
		Ranks(String f) {
			this.face = f;
		}
		public String toString () {
			return face;
		}
	}
	Suits suit;
	Ranks rank;
	
	public Card(Suits s, Ranks r) {
		super ();
		setSuit (s);
		setRank (r);
	}
	public Suits getSuit() {
		return suit;
	}
	public void setSuit(Suits suit) {
		this.suit = suit;
	}
	public Ranks getRank() {
		return rank;
	}
	public void setRank(Ranks rank) {
		this.rank = rank;
	}
	public int compareTo(Card o) {
		// 
		// If not the same suit, the order determines the trick, let the game rule determines
		// based on order or play or trump card rules    
		// 
		if (suit == o.getSuit()) {
			return rank.compareTo(o.getRank());
		}
		return 0;
	}
	public String toString () {
		return "(" + rank.toString() + suit.toString() + ")";
	}
	public boolean isSpecial() {
		return isPig () || isGoat() || isMultiplier () || isAceOfHearts ();
	}
	public boolean isPig() {
		return rank == Ranks.QUEEN && suit == Suits.SPADES; 
	}
	public boolean isGoat() {
		return rank == Ranks.JACK && suit == Suits.DIAMONDS; 
	}
	public boolean isMultiplier() {
		return rank == Ranks.TEN && suit == Suits.CLUBS; 
	}
	public boolean isAceOfHearts() {
		return rank == Ranks.ACE && suit == Suits.HEARTS; 
	}
	public boolean isTwoOfClubs () {
		return rank == Ranks.TWO && suit == Suits.CLUBS; 
	}
	public static List<Card> sort (List<Card> list) {
		if (!list.isEmpty()) {
			list.sort(new Comparator<Card>() {
				public int compare(Card o1, Card o2) {
					if (o1.getSuit() == o2.getSuit()) {
						return o1.getRank().compareTo(o2.getRank());
					}
					return o1.getSuit().compareTo(o2.getSuit());
				}
			});
		}
		return list;
	}
	public static String showList(List<Card> hand) {
		hand = sort (hand);
		String s = "[";
		for (Card c : hand) {
			s += c.toString();
		}
		s += "]";
		return s;
	}
	public static String showCSList(List<Card> played) {
		String s = "";
		String p = "";
		for (Card c : played) {
			s += p + c.rank.toString() + c.suit.toString();
			p = ",";
		}
		return s;
	}
}
