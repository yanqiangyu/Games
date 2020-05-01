package com.ialogic.games.cards.event;

import java.util.Collection;

import com.ialogic.games.cards.CardPlayer;

public class CardEventPlayerRegister extends CardEvent {
	Collection<CardPlayer> allPlayers;
	public CardEventPlayerRegister(String name) {
		super(name);
	}
	public void setAllPlayers(Collection<CardPlayer> values) {
		allPlayers = values;
	}
	public Collection<CardPlayer> getAllPlayers() {
		return allPlayers;
	}
	public String getXMLString() {
		String  p = "";
		for (CardPlayer player  : allPlayers) {
			p += String.format("<player name='%s' position='%s'/>", player.getName(), player.getPosition());
		}
		String response = String.format("<event name='%s'><message>%s</message>%s<event>",
				this.getClass().getSimpleName(), getMessage(), p);
		return response;
	}
}
