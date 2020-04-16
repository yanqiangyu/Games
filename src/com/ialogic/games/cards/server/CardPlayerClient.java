package com.ialogic.games.cards.server;

import java.io.IOException;
import java.io.PrintStream;
import java.net.Socket;

import com.ialogic.games.cards.CardPlayer;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.ui.CardUI;

public class CardPlayerClient extends CardPlayer {
	Socket client;
	CardUI server;
	
	public CardPlayerClient(Socket c) {
		client = c;
		PrintStream out;
		try {
			out = new PrintStream (client.getOutputStream());
			out.println ("Connected, enter your name");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public void register(CardUI cardSocketServer) {
		server = cardSocketServer;
	}
	public void handleEvent(CardUI ui, CardEvent request) {
		try {
			PrintStream out = new PrintStream (client.getOutputStream());
			out.println (request.getMessage());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
