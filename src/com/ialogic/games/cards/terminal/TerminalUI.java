package com.ialogic.games.cards.terminal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGame;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.CardPlayerAI;
import com.ialogic.games.cards.CardUI;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventWaitForPlayers;

public class TerminalUI implements CardUI {
	CardEvent inputEvent = new CardEventGameOver ();
	CardGame game;
	private class TerminalInput extends Thread {
		String prompt = null;
		public void run () {
			try {
				BufferedReader reader = new BufferedReader(new InputStreamReader(System.in)); 
				while (!interrupted()) {
					if (prompt != null) {
						showText (prompt + "==>");
					}
					while (System.in.available () <= 0) {
						sleep (100);
					}
					String in = reader.readLine();
					if (!in.isEmpty()) {
						if (in.toUpperCase().contentEquals("QUIT")) {
							game.gameEvent (new CardEventGameOver());
							break;
						}
						if (inputEvent instanceof CardEventPlayerRegister) {
							inputEvent.setMessage("Add Player:");
							CardPlayer p = new CardPlayerAI ();
							p.setName(in);
							if (in.startsWith("AI_")) {
								((CardPlayerAI)p).setAlgo("sim");
							}
							else {
								((CardPlayerAI)p).setAlgo("heuristic");
							}
								
							inputEvent.setPlayer(p);
							((CardEventPlayerRegister) inputEvent).setAllPlayers(game.getPlayers());
							game.gameEvent (inputEvent);
						}
					}
				}
			}
			catch (IOException ioe){
				showText (ioe.toString());
			} catch (InterruptedException e) {
			}
			showText ("Terminal Input Stopped");
		}
		public void setPrompt(String p) {
			this.prompt = p;
		}
		public void getPlayer(int numPlayer) {
			setPrompt ("Need " + numPlayer + " players, enter name:");
			inputEvent = new CardEventPlayerRegister ("");
		}
	}
	TerminalInput terminalInput = new TerminalInput (); 

	public void showText(String text) {
		System.out.println (text);
	}

	public void open(CardGame cardGame) {
		game = cardGame;
		showText ("Welcome to a game of \"" + cardGame.getName() + "\"!");
		cardGame.gameEvent (new CardEventGameStart());
	}

	public void close(CardGame cardGame) {
		terminalInput.interrupt();
		cardGame.gameEvent (new CardEventGameOver());
		showText ("Good bye!");
	}
	public void sendEvent(CardGame cardGame, CardEvent request) {
		String message = "";
		if (request instanceof CardEventGameOver) {
			cardGame.gameEvent(request);
		}
		if (request instanceof CardEventWaitForPlayers) {
			terminalInput.getPlayer (((CardEventWaitForPlayers)request).getNumPlayer());
			terminalInput.start();
		}
		else {
			if (request instanceof CardEventFaceUp) {
				terminalInput.setPrompt (null);
			}
			if (request.getPlayer() != null) {
				CardPlayer p = request.getPlayer();
				p.handleEvent (this, request);
			}
			else {
				message += "All :";
				showText (message + request.getMessage());
				for (CardPlayer p : cardGame.getPlayers()) {
					p.handleEvent (this, request);
				}
			}
		}
	}
	public void playerEvent(CardEvent request) {
		updateDisplay (request.getPlayer());
		game.playerEvent(request);
	}
	private void updateDisplay (CardPlayer p) {
		Card c= p.getCardPlayed();
		String hand = Card.showList (p.getHand());
		String faceUp = Card.showList (p.getFaceup());
		String points = Card.showList (p.getPoints());
		String card = (c == null ? "()" : c.toString());
		String line = String.format("%12s -> %4s |%-20s |%-60s|%s", 
				p.displayString (),
				card, 
				faceUp, 
				hand,
				points);
		showText (line);
	}
}
