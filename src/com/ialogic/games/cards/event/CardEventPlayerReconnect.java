package com.ialogic.games.cards.event;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerReconnect extends CardEventPlayerRegister {
	public CardEventPlayerReconnect(String message) {
		super(message);
	}
	public String getXMLString() {
		String  p = "\n";
		for (CardPlayer player  : allPlayers) {
			String cards = Card.showCSList(player.getHand());
			String faceup = Card.showCSList(player.getFaceup());
			String points = Card.showCSList(player.getPoints());
			Card c = player.getCardPlayed();
			String cardPlayed = c == null ? "NA" : c.toString().substring(1,3);
			if (player != getPlayer()) {
				// Mask other players cards;
				cards = cards.replaceAll("[^,][^,]", "NA");
			}
			p += String.format("<player name='%s' position='%s' points='%s'><hand>%s</hand><faceup>%s</faceup><cardPlayed card='%s'/></player>\n", 
					player.getName(), 
					player.getPosition(),
					points,
					cards,
					faceup,
					cardPlayed);
		}
		String response = String.format("<event name='%s'><message>%s</message>%s</event>",
				this.getClass().getSimpleName(), getMessage(), p);
		return response;
	}
}
