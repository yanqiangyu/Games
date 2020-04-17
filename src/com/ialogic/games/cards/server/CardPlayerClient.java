package com.ialogic.games.cards.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.Socket;

import com.ialogic.games.cards.Card;
import com.ialogic.games.cards.CardGameRule;
import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventDealCards;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventTurnToPlay;
import com.ialogic.games.cards.ui.CardUI;

public class CardPlayerClient extends CardPlayer {
	Socket client;
	CardUI server;
	PrintStream out;
	BufferedReader in; 
	Thread runThread;
	
	public CardPlayerClient(Socket c, CardUI svr) {
		client = c;
		server = svr;
		try {
			out = new PrintStream (client.getOutputStream());
			out.println ("Connected, welcome to the game.");
			in = new BufferedReader(new InputStreamReader (client.getInputStream()));
			new Thread () {
				public void run () {
					enterPlayerName ();
				}

			}.start();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	private void enterPlayerName()  {
		try {
			out.print("Please enter your name:");
			while (in.ready())
				in.read();
			String n = trim(in.readLine());
			setName (n);
			System.out.println (n);
			CardEventPlayerRegister e = new CardEventPlayerRegister ("New Player");
			e.setPlayer(this);
			server.playerEvent(e);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	private String trim(String readLine) {
		StringBuilder b = new StringBuilder();
		for (char c : readLine.toCharArray()) {
			if ((int) c >= (int) '0' && (int) c <= (int) 'z') {
				b.append(c);
			}
		}
		return b.toString();
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		try {
			PrintStream out = new PrintStream (client.getOutputStream());
			out.println (request.getMessage());
			if (request instanceof CardEventDealCards) {
				String debug = String.format("%12s %s", 
						displayString (),
						Card.showList(getHand()));
				out.println (debug);
			}
			else if (request instanceof CardEventFaceUp) {
				CardEventFaceUpResponse e = new CardEventFaceUpResponse (this);
				for (Card c : getHand ()) {
					if (c.isSpecial()) {
						getFaceup().add(c);
					}
				}
				e.setCards(getFaceup());
				server.playerEvent (e);
			}
			else if (request instanceof CardEventTurnToPlay) {
				final CardGameRule r = ((CardEventTurnToPlay) request).getRule();

				new Thread () {
					public void run () {
						enterPlayerTurn (r);
					}
				}.start();
				
			}
			else if (request instanceof CardEventEndRound) {
				getPoints().addAll(((CardEventEndRound)request).getPoints());
				String debug = String.format("%12s won this round %s", 
						displayString (),
						Card.showList(((CardEventEndRound)request).getPoints()));
				server.showText(debug);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	private void enterPlayerTurn (CardGameRule rule) {
		int size = rule.getAllowed().size();
		if (size > 0) {
			String prompt = String.format("\n%12s %20s %s", 
					displayString (),
					rule.getExplanation(),
					Card.showList(rule.getAllowed()));
			int n = -1;
			while (n < 0 || n >= size) {
				if (size > 1) {
					out.print (prompt);
					out.print (String.format("Enter %d-%d for the card to play:", 1, size));
				}
				else {
					out.print ("Press Enter to play:");
				}
				try {
					if (size > 13) {
						while (in.ready())
							in.read();
						String ns = trim (in.readLine());
						n = Integer.parseInt(ns) - 1;
					}
					else {
						n = 0;
					}
				}
				catch (IOException ioe) {
					n = 0;
					break;
				}
				catch (NumberFormatException e) {
				}
			}
			Card c = rule.getAllowed().remove(n);
			getHand ().remove(c);
			getFaceup().remove(c);
			setCardPlayed (c);
			server.playerEvent (new CardEventPlayerAction (this));
		}
	}
}
