package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import com.ialogic.games.cards.CardPlayer.GameMemory;
import com.ialogic.games.cards.event.CardEvent;

public class CardGameSimulation implements CardUI {
	CardGame game = new PigChase();
	public CardGameSimulation() {
		game.setUi(this);
	}
	protected HashSet<String> cslToHashSet (String csString) {
		return new HashSet<String>(Arrays.asList(csString.split(",")));
	}
	public void showText(String text) {
		System.out.println (text);
	}
	public void open(CardGame cardGame) {
	}
	public void close(CardGame cardGame) {
	}
	public void sendEvent(CardGame cardGame, CardEvent request) {
		if (request.getPlayer() != null) {
			CardPlayer p = request.getPlayer();
			p.handleEvent (this, request);
		}
		else {
			for (CardPlayer p : cardGame.getPlayers()) {
				p.handleEvent (this, request);
			}
		}
	}
	public void playerEvent(CardEvent request) {
		game.playerEvent(request);
	}
	public List<CardPlayer> setupScenario (CardPlayerAI.GameMemory memory) {
		HashSet<String>played = new HashSet<String>(memory.played);
		Map<String, HashSet<String>>faceup = new HashMap<String, HashSet<String>>();
		for (Entry<String, String> e : memory.faceup.entrySet()) {
			faceup.put (e.getKey(), cslToHashSet(e.getValue()));
		}
		HashSet<String> myHand = cslToHashSet(memory.currentHand);
		HashSet<String> fullDeck = cslToHashSet (Card.showCSList(new CardDeck(52).cards));
		HashSet<String> unknown = new HashSet<String>(fullDeck);
		for (HashSet<String> f : faceup.values()) {
			unknown.removeAll(f);
		}
		unknown.removeAll(myHand);
		unknown.removeAll(played);
		int position = played.size() % 4;
		int c[] = new int[4];
		for (int i = 0; i < 4; ++i) {
			c[i] = position < (4 - i) ? myHand.size() : myHand.size() - 1; 
		}
		List<List<String>> hands = new ArrayList<List<String>>();
		hands.add(new ArrayList<String>(myHand));
		hands.add(new ArrayList<String>());		
		hands.add(new ArrayList<String>());
		hands.add(new ArrayList<String>());
		ArrayList<String>l = new ArrayList<String>(unknown);
		while (l.size() > 0) {
			int n = (int) (Math.random() * l.size());
			String card = l.remove(n);
			for (int i = 1; i < 4; ++i) {
				if (hands.get(i).size() < c[i]) {
					hands.get(i).add(card);
					break;
				}
			}
		}
		// showText (hands.toString());
		ArrayList<CardPlayer> players = new ArrayList<CardPlayer>();
		int start = memory.played.size() - (memory.played.size() % 4);
		for (int i = 0; i < 4; ++i) {
			CardPlayer p = new CardPlayerAI("P"+i);
			if (position >= (4 - i)) {
				p.setCardPlayed(new Card(memory.played.get(start + (i + position)%4)));
			}
			for (String s : hands.get(i)) {
				p.getHand().add(new Card(s));
			}
			players.add(p);
		}
		return players;
	}
	public int runSimulation (GameMemory memory, String card, long timeout) {
		long s0 = System.currentTimeMillis();
		int max = -1000000;
		int min = 1000000;
		int n = 1000;
		for (int i = 0; i < n; ++i) {
			List<CardPlayer>players = setupScenario(memory);
			players.get(0).playCard (card);
			game.runSimulation (players);
			int t0 = players.get(0).getScore() + players.get(2).getScore();
			int t1 = players.get(1).getScore() + players.get(3).getScore();
			int t = t0 - t1;
			if (t > max) {
				max = t;
			}
			if (t < min) {
				min = t;
			}
			if (System.currentTimeMillis() - s0 > timeout) {
				n = i;
			}
		}
		// showText("Cases: " + n + " Elapsed time:" + (System.currentTimeMillis() - s0));
		return min + max;
	}
	public int getRecommendation(GameMemory memory, int timeout) {
		int n = 0;
		int eval = -1000000;
		int i = 0;
		for (String card : memory.allowed.split(",")) {
			int score = runSimulation(memory, card, timeout); 
			if ( score > eval) {
				n = i;
				eval = score;
			}
			++i;
		}
		return n;
	}
	static public void main (String args[]) {
		CardGameSimulation sim = new CardGameSimulation ();
		CardPlayerAI player = new CardPlayerAI("P0");
		player.memory.currentHand="AH,KS,8C,5C,6D,4D,XH,3D,AD,JC,XS,7S,6S";
		player.memory.allowed="3D,AD,6D,4D";
		player.memory.faceup = new HashMap<String, String>();
		player.memory.played = new ArrayList<String>();
		player.memory.played.add("JD");
		player.memory.played.add("KD");
		for (String card : player.memory.allowed.split(",")) {
			sim.showText("Test card:" + card + " simulation score : " +
			sim.runSimulation(player.memory, card, 1000));
		}
		sim.showText("Recommendation: " + player.memory.allowed.split(",")[sim.getRecommendation(player.memory, 1000)]);
	}
}
