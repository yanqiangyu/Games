package com.ialogic.games.cards;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonWriter;
import javax.json.JsonWriterFactory;
import javax.json.stream.JsonGenerator;

import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventGameOver;

public abstract class CardGame {
	protected CardUI ui;
	LinkedBlockingQueue<CardEvent>events = new LinkedBlockingQueue<CardEvent> ();

	public CardUI getUi() {
		return ui;
	}
	public void setUi(CardUI ui) {
		this.ui = ui;
	}
	public void play() {
		ui.open(this);
		while (!isGameOver()) {
			CardEvent input = getEvent ();
			handleEvent (input);
		}
		ui.close (this);
	}
	public void playerEvent(CardEvent request) {
		for (CardPlayer p : getPlayers()) {
			if (p != request.getPlayer()) {
				p.handleEvent (ui, request);
			}
		}
		gameEvent (request);
	}
	public CardEvent getEvent () {
		try {
			return events.take();
		} catch (InterruptedException e) {
			// Don't print anything, called by simulators a lot;
		}
		return new CardEventGameOver();
	}
	public void gameEvent(CardEvent e) {
		events.offer(e);
	}
	public String jsonPrettyPrint (String jsonString) {
	    StringWriter sw = new StringWriter();
	    try {
	       JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
	       JsonObject jsonObj = jsonReader.readObject();
	       Map<String, Object> map = new HashMap<>();
	       map.put(JsonGenerator.PRETTY_PRINTING, true);
	       JsonWriterFactory writerFactory = Json.createWriterFactory(map);
	       JsonWriter jsonWriter = writerFactory.createWriter(sw);
	       jsonWriter.writeObject(jsonObj);
	       jsonWriter.close();
	    } catch(Exception e) {
	       e.printStackTrace();
	    }
	    return sw.toString();
	}
	public abstract boolean isGameOver();
	public abstract void handleEvent(CardEvent e);
	public abstract String getName();
	public abstract List<CardPlayer> getPlayers();
	public abstract List<Card> getTable();
	public abstract ArrayList<String> runSimulation(List<CardPlayer> players);
}
