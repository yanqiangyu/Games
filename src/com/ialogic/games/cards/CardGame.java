package com.ialogic.games.cards;

import java.util.List;

import com.ialogic.games.cards.event.CardEvent;

public abstract class CardGame {
	protected CardUI ui;
	public CardUI getUi() {
		return ui;
	}
	public void setUi(CardUI ui) {
		this.ui = ui;
	}
	public void play() {
		ui.open(this);
		while (!isGameOver()) {
			CardEvent input = ui.getEvent (this);
			handleEvent (input);
		}
		ui.close (this);
	}
	public abstract boolean isGameOver();
	public abstract void handleEvent(CardEvent e);
	public abstract String getName();
	public abstract List<CardPlayer> getPlayers();
	public abstract List<Card> getTable();
}
