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
	private boolean analysisMode = false;
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

		int nf=1;
		for (HashSet<String> f : faceup.values()) {
			for (String s : f) {
				if (!s.isEmpty()) {
					for (String f1 : s.split (",")) {
						if (!f1.isEmpty() && !f1.contentEquals("NA")) {
							hands.get(nf).add (f1);
						}
					}
				}
			}
			nf++;
		}
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
		int total =  memory.played.size();
		for (List<String> h : hands) {
			total += h.size();
		}
		if (total != 52) {
			showText ("ASSERTION FAILED");
			showText ("Played: " + memory.played.size() + memory.played.toString());
			showText ("MyHand: " + myHand.size() + myHand.toString());
			showText ("Unknown: " + unknown.size() + unknown.toString());
			showText ("Dist: " + Arrays.toString(c));
			for (List<String> h : hands) {
				showText ("Hand:" + h.size() + h.toString());
			}
			showText ("ABORT");
		}

		ArrayList<CardPlayer> players = new ArrayList<CardPlayer>();
		int start = memory.played.size() - (memory.played.size() % 4);
		for (int i = 0; i < 4; ++i) {
			CardPlayer p = new CardPlayerAI("P"+i);
			// p.setAlgo("heuristic");
			if (position >= (4 - i)) {
				p.setCardPlayed(new Card(memory.played.get(start + (i + position) %4)));
			}
			for (String s : hands.get(i)) {
				p.getHand().add(new Card(s));
			}
			p.getMemory().played.addAll (memory.played);
			players.add(p);
		}
		return players;
	}
	private int runSimulation (GameMemory memory, String card, int n, long timeout) {
		long s0 = System.currentTimeMillis();
		int max = -1000000;
		int min = 1000000;
		int mean = 0;
		double m2 = 0.0;
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
			int d = t - mean;
			int c = i + 1;
			mean += d / c;
			int d2 = t - mean;
			m2 += (double) d * d2;
			if (System.currentTimeMillis() - s0 > timeout && i > 10) {
				n = i;
			}
		}
		if (isAnalysisMode()) {
			double std = Math.sqrt((m2/(n-1)));
			int maxd = (int) (mean + (2 * std));
			int mind = (int) (mean - (2 * std));
			showText(String.format("Score:%6d Stats:%6d (%6d %6d %6d %6f) (%d, %d, %d) time:%6d", 
					(min + max), n, max, mean, min, std,
					(mind + maxd), maxd, mind,
					(System.currentTimeMillis() - s0)));
		}
		return min + max;
	}
	public int getHeuristicRecommendation(GameMemory memory) {
		String cards[] = memory.allowed.split(",");
		int n = (int) (Math.random() * (double) cards.length);
		List<CardPlayer>players = setupScenario(memory);
		boolean hasPig = false;
		boolean hasGoat = false;
		for (CardPlayer p : players) {
			Card c = p.getCardPlayed();
			if (c != null) {
				if (c.isPig()) {
					hasPig = true;
				}
				else if (c.isGoat()) {
					hasGoat = true;
				}
			}
		}
		if (hasGoat || hasPig) {
			n = hasPig ? 0 : cards.length-1;
		}
		return n;
	}
	private int getRecommendation2 (GameMemory memory, int timeout) {
		int n = 0;
		String cards[] = memory.allowed.split(",");
		int countWins [] = new int[cards.length];
		
		for (int k= 0; k < 100; ++k) {
			int scores[] = new int[cards.length];
			for (int i = 0; i < cards.length; ++i) {
				scores[i] = -1000000;
			}
			List<CardPlayer>players = setupScenario(memory);
			for (int i = 0; i < cards.length; ++i) {
				List<CardPlayer>sp = copyScenario (players);
				sp.get(0).playCard (cards[i]);
				game.runSimulation (sp);
				int t0 = sp.get(0).getScore() + sp.get(2).getScore();
				int t1 = sp.get(1).getScore() + sp.get(3).getScore();
				scores[i] = (t0 - t1);
				if (scores[i] > scores[n]) {
					n = i;
				}
			}
			countWins[n]++;
		}
		n = 0;
		for (int i = 0; i < cards.length; ++ i) {
			if (countWins[i] > countWins[n]) {
				n = i;
			}
		}
		if (isAnalysisMode()) {
			showText ("Scores:" + Arrays.toString(countWins)); 
		}
		return n;
	}
	private List<CardPlayer> copyScenario(List<CardPlayer> players) {
		ArrayList<CardPlayer> copy = new ArrayList<CardPlayer>();
		for (CardPlayer p : players) {
			CardPlayer c = new CardPlayerAI();
			c.setAlgo(p.getAlgo());
			c.setCardPlayed(p.getCardPlayed());
			c.setCurScore(p.getCurScore());
			c.getFaceup().addAll(p.getFaceup());
			c.getHand().addAll(p.getHand());
			c.setName(p.getName());
			c.getPoints().addAll(p.getPoints());
			c.setPosition(p.getPosition());
			c.setScore(p.getScore());
			c.getTricks().addAll(p.getTricks());
			copy.add(c);
		}
		return copy;
	}
	public int getRecommendation(GameMemory memory, int timeout) {
		int n = 0;
		int eval = -1000000;
		int i = 0;
		for (String card : memory.allowed.split(",")) {
			int score = runSimulation(memory, card, 1000, timeout); 
			if ( score > eval) {
				n = i;
				eval = score;
			}
			++i;
		}
		return n;
	}
	public boolean isAnalysisMode() {
		return analysisMode;
	}
	public void setAnalysisMode(boolean analysisMode) {
		this.analysisMode = analysisMode;
	}
	static public void main (String args[]) {
		CardGameSimulation sim = new CardGameSimulation ();
		CardPlayerAI player = new CardPlayerAI("P0");
		player.memory.currentHand="AH,KS,8C,5C,6D,4D,XH,3D,JD,JC,XS,7S,6S";
		player.memory.allowed="3D,JD,6D,4D";
		player.memory.faceup = new HashMap<String, String>();
		player.memory.played = new ArrayList<String>();
		player.memory.played.add("5D");
		player.memory.played.add("2D");
		sim.setAnalysisMode(true);
		sim.showText("Recommendation: " + player.memory.allowed.split(",")[sim.getRecommendation(player.memory, 100)]);
		sim.showText("Recommendation: " + player.memory.allowed.split(",")[sim.getRecommendation2 (player.memory, 100)]);
	}
}
