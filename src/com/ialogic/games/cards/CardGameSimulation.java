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
	Card goat = new Card ("JD");
	Card pig = new Card ("QS");

	private boolean analysisMode = false;
	public CardGameSimulation() {
		game.setUi(this);
	}
	protected HashSet<String> cslToHashSet (String csString) {
		HashSet<String> set = new HashSet<String>(Arrays.asList(csString.split(",")));
		set.remove("");
		set.remove("NA");
		return set;
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
		
		// Unknown cards are all cards not played or shown on the table
		HashSet<String> myHand = cslToHashSet(memory.currentHand);
		HashSet<String> fullDeck = cslToHashSet (Card.showCSList(new CardDeck(52).cards));
		HashSet<String> unknown = new HashSet<String>(fullDeck);
		for (HashSet<String> f : faceup.values()) {
			f.removeAll(played);
			unknown.removeAll(f);
		}
		unknown.removeAll(myHand);
		unknown.removeAll(played);
		
		
		// Count the number of cards left for each player
		int position = played.size() & 0x3;
		int c[] = new int[4];
		for (int i = 0; i < 4; ++i) {
			c[i] = position < (4 - i) ? myHand.size() : myHand.size() - 1; 
		}
		
		// Add my own hand
		List<List<String>> hands = new ArrayList<List<String>>();
		hands.add(new ArrayList<String>(myHand));

		// Assign known cards 
		for (int i = 1; i < 4; ++i) {
			ArrayList<String> hand = new ArrayList<String>();
			if (faceup.containsKey(memory.names[i])) {
				hand.addAll (faceup.get(memory.names[i]));
			}
			hands.add(hand);
		}
		
		// Create random distribution with consideration no suit hints from card played
		ArrayList<String>l = new ArrayList<String>(unknown);
		String suits[] = new String [] {"C","D","H","S"};
		int d = l.size();
		while (d > 0) {
			for (String suit : suits) {
				for (int i = 1; i < 4; ++i) {
					if (hands.get(i).size() < c [i]) {
						int n = (int) (Math.random() * d);
						String card = l.get(n);
						int j = 0;
						while (!card.substring(1,2).contentEquals(suit) 
								&& memory.noSuit.get(i).contains(card.substring(1,2)) 
								&& j < d) {
							++j;
							card = l.get((n+j) % d);
						}
						if (j < d) {
							l.remove((n+j) % d);
							hands.get(i).add(card);
							d = l.size();
							if (d <=0 ) {
								break;
							}
						}
					}
				}
				if (d <= 0 ) {
					break;
				}
			}
		}
		
		// Validation in case we made a mistake in the steps above
		int total =  memory.played.size();
		for (List<String> h : hands) {
			total += h.size();
		}
		if (total != 52) {
			showText ("ASSERTION FAILED");
			showText ("Names: " + Arrays.toString(memory.names));
			showText ("Faceup: " + faceup.size() + faceup.toString());
			showText ("Played: " + memory.played.size() + memory.played.toString());
			showText ("MyHand: " + myHand.size() + myHand.toString());
			showText ("Unknown: " + unknown.size() + unknown.toString());
			showText ("Dist: " + Arrays.toString(c));
			showText ("NoSuit: " + memory.noSuit.toString());
			for (List<String> h : hands) {
				showText ("Hand:" + h.size() + h.toString());
			}
			showText ("Exception ABORT");
		}
		
		// Create players with a random scenario to run simulation
		ArrayList<CardPlayer> players = new ArrayList<CardPlayer>();
		int start = memory.played.size() - (memory.played.size() % 4);
		for (int i = 0; i < 4; ++i) {
			CardPlayer p = new CardPlayerAI(memory.names[i]);
			p.setAlgo("heuristic");
			if (position >= (4 - i)) {
				p.setCardPlayed(new Card(memory.played.get(start + (i + position) %4)));
			}
			for (String s : hands.get(i)) {
				p.getHand().add(new Card(s));
			}
			String pts = memory.points.get(p.getName());
			if (pts != null) {
				for (String s : pts.split(",")) {
					if (!s.isEmpty()) {
						p.getPoints().add(new Card(s));
					}
				}
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
			if (System.currentTimeMillis() - s0 > timeout && i > 30) {
				n = i;
			}
		}
		if (card.contentEquals("JD") || card.contentEquals("QS")) {
			max -= Math.sqrt((m2/(n-1)));
		}
		int round = memory.played.size() / 4;
		round = round > 6 ? 6 : round;
		int score =  (round * max + (13 - round) * min) / 13;
		
		if (isAnalysisMode()) {
			double std = Math.sqrt((m2/(n-1)));
			int maxd = (int) (mean + (2 * std));
			int mind = (int) (mean - (2 * std));
			showText(String.format("Score:%6d Stats:%6d (%6d %6d %6d %6f) (%d, %d, %d) time:%6d", 
					score, n, max, mean, min, std,
					(mind + maxd), maxd, mind,
					(System.currentTimeMillis() - s0)));
		}
		return score;
	}
	public int getHeuristicRecommendation(GameMemory memory) {
		String cards[] = memory.allowed.split(",");
		int n = (int) (Math.random() * (double) cards.length);
		int s = memory.played.size();
		int nc = s % 4;
		boolean hasPig = false;
		boolean hasGoat = false;
		int hasGoatTrap = -1;
		int hasPigTrap = -1;
		for (int i = 0; i < nc; ++i) {
				Card c = new Card(memory.played.get(s-i-1));
				if (c != null) {
					if (c.isPig()) {
						hasPig = true;
					}
					else if (c.isGoat()) {
						hasGoat = true;
					}
					else if (c.compareTo (goat) > 0) {
						hasGoatTrap = i;
					}
					else if (c.compareTo (pig) > 0) {
						hasPigTrap = i;
					}
				}
		}
		if ((hasGoatTrap >= 0 && hasGoatTrap != 1 && cards[n] == "JD") ||
			(hasPigTrap == 1 && cards[n] == "QS")) {
			// Avoid sending goat to your opponents 
			// Avoid sending pig to your partner
			// if possible
			n = (n+1) % cards.length;
		}
		if (hasGoat || hasPig) {
			n = hasPig ? 0 : cards.length-1;
		}
		return n;
	}
	public int getRecommendation(GameMemory memory, int timeout) {
		int n = 0;
		String cards[] = memory.allowed.split(",");
		int eval = -1000000;
		int i = 0;
		for (String card : cards ) {
			int score = runSimulation(memory, card, 1000, timeout); 
			if ( score > eval) {
				n = i;
				eval = score;
			}
			++i;
		}
		return n;
	}
	private int getRecommendation2 (GameMemory memory, int timeout) {
		int n = 0;
		String cards[] = memory.allowed.split(",");
		int countWins [] = new int[cards.length];
		
		for (int k= 0; k < 30; ++k) {
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
				scores[i] = t0-t1;
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
			c.memory = p.getMemory();
			copy.add(c);
		}
		return copy;
	}
	public boolean isAnalysisMode() {
		return analysisMode;
	}
	public void setAnalysisMode(boolean analysisMode) {
		this.analysisMode = analysisMode;
	}
	static String debugPlayed = "7C,4C,QC,3C,5S,KS,AH,6S,AD,7D,JD,XD,JC,KC,6C,5C,5H,QH,JH,3H,9S,AS,QS,6D,8H,7S,2H,7H,4D,3D,9D,KH,3D,AC,9H,XC,KD,2C,4H,2D,QD,6H,4S,XH,8D,2S,3S";
	static String debugHand = "9C,8C";
	static public void main (String args[]) {
		CardGameSimulation sim = new CardGameSimulation ();
		CardPlayerAI player = new CardPlayerAI("AI_1");
		//player.memory.currentHand="2C,6C,2D,3D,AD,JD,3H,4H,2H,8H,3S,4S,JS";
		player.memory.currentHand=debugHand;
		player.memory.allowed="9";
		player.memory.faceup = new HashMap<String, String>();
		// player.memory.faceup.put("AI_1", "JD");
		player.memory.names = new String [] {"AI_1", "AI_2", "AI3","AI4"};
		player.memory.played = new ArrayList<String>();
		String played = debugPlayed;
		for (String s : played.split(",")) {
			if (!played.isEmpty())
				player.memory.played.add(s);
		}
		sim.setAnalysisMode(true);
		sim.showText("Recommendation 1: " + player.memory.allowed.split(",")[sim.getHeuristicRecommendation(player.memory)]);
		sim.showText("Recommendation 2: " + player.memory.allowed.split(",")[sim.getRecommendation2 (player.memory, 500)]);
		sim.showText("Recommendation 3: " + player.memory.allowed.split(",")[sim.getRecommendation(player.memory, 500)]);
	}
}
