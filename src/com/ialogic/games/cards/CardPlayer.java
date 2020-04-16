package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.List;

import com.ialogic.games.cards.Card.Suits;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventDealCards;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventTurnToPlay;
import com.ialogic.games.cards.ui.CardUI;

public class CardPlayer {
	String name;
	int score;
	List<Card>hand = new ArrayList<Card>();
	List<Card>faceup = new ArrayList<Card>();
	List<Card>points = new ArrayList<Card>();
	List<Card>tricks = new ArrayList<Card>();
	Card cardPlayed = null;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getScore() {
		return score;
	}
	public void setScore(int score) {
		this.score = score;
	}
	public List<Card> getHand() {
		return hand;
	}
	public void setHand(List<Card> hand) {
		this.hand = hand;
	}
	public List<Card> getFaceup() {
		return faceup;
	}
	public void setFaceup(List<Card> faceup) {
		this.faceup = faceup;
	}
	public List<Card> getPoints() {
		return points;
	}
	public void setPoints(List<Card> points) {
		this.points = points;
	}
	public List<Card> getTricks() {
		return tricks;
	}
	public void setTricks(List<Card> tricks) {
		this.tricks = tricks;
	}
	public Card getCardPlayed() {
		return cardPlayed;
	}
	public void setCardPlayed(Card cardPlayed) {
		this.cardPlayed = cardPlayed;
	}
	public void collectTrick(List<Card>trick) {
		this.tricks.addAll(trick);
	}
	public String displayString() {
		String s = getName () + ": ";
		return s;
	}
	public void handleEvent (CardUI ui, CardEvent request) {
		if (request instanceof CardEventDealCards) {
			String debug = String.format("%12s %s", 
					displayString (),
					Card.showList(getHand()));
			ui.showText(debug);
			getFaceup().clear();
			getPoints().clear();
			getTricks().clear();
			setCardPlayed(null);
		}
		else if (request instanceof CardEventFaceUp) {
			CardEventFaceUpResponse e = new CardEventFaceUpResponse (this);
			for (Card c : getHand ()) {
				if (c.isSpecial() && countSuit (c.getSuit()) > 4) {
					getFaceup().add(c);
				}
			}
			e.setCards(getFaceup());
			ui.playerEvent (e);
		}
		else if (request instanceof CardEventTurnToPlay) {
			CardGameRule r = ((CardEventTurnToPlay) request).getRule();
			String debug = String.format("%12s %20s %s", 
					displayString (),
					r.getExplanation(),
					Card.showList(r.getAllowed()));
					
			ui.showText(debug);
			if (r.getAllowed().size() > 0) {
				int n = (int) (Math.random() * (double) r.getAllowed().size());
				Card c = r.getAllowed().remove(n);
				getHand ().remove(c);
				getFaceup().remove(c);
				setCardPlayed (c);
			}
			ui.playerEvent (new CardEventPlayerAction (this));
		}
		else if (request instanceof CardEventEndRound) {
			getPoints().addAll(((CardEventEndRound)request).getPoints());
			String debug = String.format("%12s won this round %s", 
					displayString (),
					Card.showList(((CardEventEndRound)request).getPoints()));
			ui.showText(debug);
		}
	}
	private int countSuit(Suits suit) {
		int count = 0;
		for (Card c : getHand()) {
			if (c.getSuit() == suit) {
				++count;
			}
		}
		return count;
	}
}
