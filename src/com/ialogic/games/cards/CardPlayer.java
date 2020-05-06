package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.ialogic.games.cards.event.CardEvent;

public abstract class CardPlayer {
	String name;
	int score;
	int curScore;
	List<Card>hand = Collections.synchronizedList(new ArrayList<Card>());
	List<Card>faceup =  Collections.synchronizedList(new ArrayList<Card>());
	List<Card>points =  Collections.synchronizedList(new ArrayList<Card>());
	List<Card>tricks =  Collections.synchronizedList(new ArrayList<Card>());
	Card cardPlayed = null;
	int position;
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
	public void setPosition(int i) {
		this.position = i;
	}
	public int getPosition() {
		return this.position;
	}
	public int getCurScore() {
		return curScore;
	}
	public void setCurScore(int curScore) {
		this.curScore = curScore;
	}
	public void playCard(String cs) {
		Card played = null;
		for (Card c : getHand ()) {
			if (c.toString().contains(cs)) {
				played = c;
				break;
			}
		}
		if (played != null) {
			getHand ().remove(played);
			getFaceup().remove(played);
			setCardPlayed (played);
		}
	}
	public void faceupCards(String cs) {
		if (!cs.isEmpty()) {
			String cards[] = cs.split(",");
			for (Card c : getHand ()) {
				for (String f : cards) {
					if (c.toString().contains(f)) {
						getFaceup().add(c);
						break;
					}
				}
			}
		}
	}
	abstract public void handleEvent (CardUI ui, CardEvent request);
}
