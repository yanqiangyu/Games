package com.ialogic.games.cards;

import com.ialogic.games.cards.event.CardEvent;

public interface CardUI {
	void showText (String text);
	void open(CardGame cardGame);
	void close(CardGame cardGame);
	void sendEvent (CardGame cardGame, CardEvent request);
	void playerEvent (CardEvent request);
	CardEvent getEvent(CardGame cardGame);
}
