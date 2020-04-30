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
	public String getXMLString() {
		String  p = "";
		if (getPlayer() != null ) {
			p = String.format("<player name='%s' position='0'/>", getPlayer().getName());
		}
		String response = String.format("<event name='%s'><message>%s</message>%s<event>",
				this.getClass().getSimpleName(), getMessage(), p);
		return response;
	}
}
