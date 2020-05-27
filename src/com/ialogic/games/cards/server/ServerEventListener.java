package com.ialogic.games.cards.server;

public interface ServerEventListener {
	void handleWebSocket (String id, String message);
}
