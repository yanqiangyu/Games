package com.ialogic.games.cards;

import com.ialogic.games.cards.ui.CardUI;
import com.ialogic.games.cards.ui.TerminalUI;

public class CardPlayTest {
	static public void main (String args[]) {
		CardUI ui = new TerminalUI ();
		CardGame game = new PigChase ();
		game.setUi(ui);
		game.play ();
	}
}
