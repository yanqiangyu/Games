package com.ialogic.games.cards.event;

public class CardEventWaitForPlayers extends CardEvent {
	int numPlayer;
	public CardEventWaitForPlayers() {
		super("Request players");
	}
	public int getNumPlayer() {
		return numPlayer;
	}
	public void setNumPlayer(int numPlayer) {
		this.numPlayer = numPlayer;
	}
}
