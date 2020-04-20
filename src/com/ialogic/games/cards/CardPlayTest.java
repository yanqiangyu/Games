package com.ialogic.games.cards;

import com.ialogic.games.cards.terminal.TerminalUI;

public class CardPlayTest {
	static public void main (String args[]) {
		CardUI ui = new TerminalUI ();
		CardGame game = new PigChase ();
		game.setUi(ui);
		game.play ();
	}
}
