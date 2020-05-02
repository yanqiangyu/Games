package com.ialogic.games.cards.event;

import java.util.HashMap;
import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerAction extends CardEvent {
	String cardPlayed;
	public CardEventPlayerAction(String message) {
		super(message);
	}
	public CardEventPlayerAction(CardPlayer p) {
		super("Turn played");
		setPlayer (p);
	}
	public String getCardPlayed() {
		return cardPlayed;
	}
	public void setCardPlayed(String cardPlayed) {
		this.cardPlayed = cardPlayed;
	}
	public void setFieldValues(HashMap<String, String> request) {
		cardPlayed = request.get("cards");
	}
	public String getXMLString() {
		String response = String.format("<event name='%s'><message>%s</message><player name='%s'/>"+
				"<cardPlayed card='%s'/><event>",
				this.getClass().getSimpleName(), getMessage(), 
				getPlayer().getName(), cardPlayed);
		return response;
	}
}
