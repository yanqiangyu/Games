package com.ialogic.games.cards.event;

import com.ialogic.games.cards.CardPlayer;

public class CardEvent {
	String message;
	CardPlayer player;
	
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public CardEvent(String message) {
		this.message = message;
	}
	public static CardEvent getEvent(String message) {
		return new CardEvent (message);
	}
	public CardPlayer getPlayer() {
		return player;
	}
	public void setPlayer(CardPlayer player) {
		this.player = player;
	}
}
