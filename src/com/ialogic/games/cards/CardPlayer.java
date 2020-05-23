package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import com.ialogic.games.cards.Card.Suits;
import com.ialogic.games.cards.CardPlayer.GameMemory;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventScoreBoard;
import com.ialogic.games.cards.event.CardEventTurnToPlay;

public abstract class CardPlayer {
	String name;
	int score;
	int curScore;
	private CardEventScoreBoard scoreBoard = null;
	List<Card>hand = Collections.synchronizedList(new ArrayList<Card>());
	List<Card>faceup =  Collections.synchronizedList(new ArrayList<Card>());
	List<Card>points =  Collections.synchronizedList(new ArrayList<Card>());
	List<Card>tricks =  Collections.synchronizedList(new ArrayList<Card>());
	Card cardPlayed = null;
	int position;
	String algo = "random";
	GameMemory memory = new GameMemory ();
	public class GameMemory {
		List<String>played = new ArrayList<String>();
		String names[] = new String[4];
		Map<String, String>faceup = new HashMap<String,String>();
		Map<String, String>points = new HashMap<String,String>();
		public String currentHand = "";
		public String allowed = "";
		public String toString () {
			return String.format("Memory:%s, %s, played=%s, faceups=%s, points=%points, hand=%s",
				getName(),
				names,
				played.toString(),
				faceup.toString(),
				points.toString(),
				currentHand);
		}
	};
	public GameMemory getMemory() {
		return memory;
	}
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
	public String getAlgo () {
		return algo;
	}
	public void setAlgo (String a) {
		this.algo = a;
	}
	void playCard(String cs) {
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
	void faceupCards(String cs) {
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
	private void endRound() {
		getTricks().add(cardPlayed);
		setCardPlayed(null);
	}
	private void setScoreBoard(CardEventScoreBoard scoreBoard) {
		this.scoreBoard = scoreBoard;
	}
	public CardEventScoreBoard getScoreBoard() {
		return scoreBoard;
	}
	public int countSuit(Suits suit) {
		int count = 0;
		for (Card c : getHand()) {
			if (c.getSuit() == suit) {
				++count;
			}
		}
		return count;
	}
	public void memorizeEvent (CardEvent request) {
		if (request instanceof CardEventEndRound) {
			endRound ();
		}
		if (request instanceof CardEventPlayerRegister) {
			for (CardPlayer p : ((CardEventPlayerRegister)request).getAllPlayers()) {
				int idx = (p.getPosition() - getPosition() + 4) %4;
				memory.names[idx] = p.getName();
			}
		}
		else if (request instanceof CardEventFaceUpResponse) {
			String f = ((CardEventFaceUpResponse)request).getCardPlayed();
			if (request.getPlayer() == this) {
				faceupCards (f);
			}
			memory.faceup.put (request.getPlayer().getName(), f == null ? "" : f);
		}
		else if (request instanceof CardEventPlayerAction) {
			String p = ((CardEventPlayerAction)request).getCardPlayed();
			if (request.getPlayer() == this) {
				playCard (p);
			}
			memory.played.add (p);
			memory.points.put (request.getPlayer().getName(), Card.showCSList(request.getPlayer().getPoints()));
		}
		else if (request instanceof CardEventScoreBoard) {
			setScoreBoard ((CardEventScoreBoard) request);
			String names[] = memory.names;
			memory = new GameMemory();
			memory.names = names;
		}
	}
	public JsonValue getJsonObject(boolean masked) {
		String hand = Card.showCSList(getHand());
		if (masked) {
			hand = hand.replaceAll("[^,][^,]", "NA");
		}
		JsonObjectBuilder builder =  Json.createObjectBuilder()
				.add("name",getName())
				.add("position", getPosition())
				.add("points", Card.showCSList(getPoints()))
				.add("faceup", Card.showCSList(getFaceup()))
				.add("hand", hand);
				
		if (getCardPlayed() != null) {
				builder.add("card", getCardPlayed().toString().substring(1,3));
		}
		return builder.build();
	}
	public JsonValue getJsonObjectId() {
		return Json.createObjectBuilder()
				.add("name",getName())
				.add("position",getPosition ()).build();
	}
	abstract public void handleEvent (CardUI ui, CardEvent request);
}
