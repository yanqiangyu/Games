package com.ialogic.games.cards.event;

import java.util.ArrayList;

public class CardEventScoreBoard extends CardEvent {
	ArrayList<String> text = new ArrayList<String>();
	public CardEventScoreBoard(String message) {
		super(message);
	}

	public void addLine(String ps) {
		text.add(ps);
	}
	public String getXMLString() {
		String response = String.format("<event name='%s'><message>%s</message>",
				this.getClass().getSimpleName(), getMessage());
		for (String line : text) {
			response +=String.format ("<line>%s</line>", line);
		}
		response += "</event>";
		return response;
	}
}
