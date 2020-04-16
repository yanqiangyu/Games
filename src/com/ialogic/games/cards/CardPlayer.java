package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.List;

import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.ui.CardUI;

public abstract class CardPlayer {
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
	abstract public void handleEvent (CardUI ui, CardEvent request);
}
