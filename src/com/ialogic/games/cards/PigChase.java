package com.ialogic.games.cards;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.ialogic.games.cards.Card.Suits;
import com.ialogic.games.cards.event.CardEvent;
import com.ialogic.games.cards.event.CardEventDealCards;
import com.ialogic.games.cards.event.CardEventEndRound;
import com.ialogic.games.cards.event.CardEventFaceUp;
import com.ialogic.games.cards.event.CardEventFaceUpResponse;
import com.ialogic.games.cards.event.CardEventGameOver;
import com.ialogic.games.cards.event.CardEventGameStart;
import com.ialogic.games.cards.event.CardEventPlayerAction;
import com.ialogic.games.cards.event.CardEventPlayerRegister;
import com.ialogic.games.cards.event.CardEventScoreBoard;
import com.ialogic.games.cards.event.CardEventShuffleEffect;
import com.ialogic.games.cards.event.CardEventTurnToPlay;
import com.ialogic.games.cards.event.CardEventWaitForPlayers;

public class PigChase extends CardGame {
	boolean gameOver=false;
	List<CardPlayer>players=new ArrayList<CardPlayer>();
	CardDeck deck = new CardDeck (52);
	ConcurrentHashMap<CardPlayer, List<Card>>faceUps = new ConcurrentHashMap<CardPlayer, List<Card>>();
	private final Object playerReady = new Object();
	
	Thread runThread = new Thread () {
		public void run () {
			startGamePlay ();
		}
	};

	int turn = 0;
	
	public void setPlayers(List<CardPlayer> player) {
		this.players = player;
	}
	public List<CardPlayer> getPlayers() {
		return this.players;
	}
	public String getName() {
		return "Pig Chase";
	}
	public List<Card> getTable() {
		return deck.played ();
	}
	public void handleEvent (CardEvent e) {
		if (e instanceof CardEventGameStart) {
			if (!runThread.isAlive()) {
				runThread.start ();
			}
		}
		else if (e instanceof CardEventPlayerRegister) {
			synchronized (playerReady) {
				if (getPlayers().size() < 4) {
					getPlayers().add(e.getPlayer());
					ui.showText("Total player:" + getPlayers ().size());
					if (getPlayers().size () == 4) {
						playerReady.notifyAll();
					}
				}
				else {
					ui.showText("Extra Player Ignored");
					playerReady.notifyAll();
				}
			}
		}
		else if (e instanceof CardEventFaceUpResponse) {
			synchronized (faceUps) {
				if (!faceUps.containsKey(e.getPlayer())) {
					List<Card>f = new ArrayList<Card>();
					f.addAll (e.getPlayer().getFaceup());
					faceUps.put(e.getPlayer(), f);
				}
				if (faceUps.keySet().size() == 4) {
					faceUps.notifyAll ();
				}
			}
		}
		else if (e instanceof CardEventPlayerAction) {
			synchronized (e.getPlayer()) {
				e.getPlayer().notifyAll();
			}
		}
		else if (e instanceof CardEventGameOver) {
			runThread.interrupt();
			setGameOver (true);
		}
	}
	private void startGamePlay () {
		try {
			CardEventWaitForPlayers r = new CardEventWaitForPlayers ();
			r.setNumPlayer(4);
			ui.sendEvent (this, r);
			
			waitForPlayerReady ();
			
			CardPlayerTeam teams[] = new CardPlayerTeam[2];
			teams[0] = new CardPlayerTeam ();
			teams[0].getPlayers().add (getPlayers().get(0));
			teams[0].getPlayers().add (getPlayers().get(2));
			teams[1] = new CardPlayerTeam ();
			teams[1].getPlayers().add (getPlayers().get(1));
			teams[1].getPlayers().add (getPlayers().get(3));
			
			int starter = -1;
			for (int hand = 1; hand <= 100 && !isGameOver(); ++hand) {
				ArrayList<String>testCases = new ArrayList<String>();
				String banner = String.format("====================  Playing hand %-5d===================", hand);
				ui.showText(banner);
				deck.shuffle ();
				ui.sendEvent (this, new CardEventShuffleEffect());
				deck.deal (players);
				testCases.add (Card.showCSList (Card.sort(players.get(0).getHand())));
				for (CardPlayer p : getPlayers()) {
					ui.sendEvent (this, new CardEventDealCards (p));
				}
				ui.showText("===========================================================");
				synchronized (faceUps) {
					faceUps.clear();
					ui.sendEvent (this, new CardEventFaceUp());
					faceUps.wait();
				}
				if (starter < 0) {
					starter = findStarter();
					banner = String.format("====================%-20s===================", "    Two of Clubs");
					ui.showText(banner);
				}
				else {
					banner = String.format("====================%-20s===================", "     Last Pig");
					ui.showText(banner);
				}
				Set<Suits> suitsPlayed = new HashSet <Suits>();
				for (int round = 1; round <= 13; ++round) {
					int newStarter = starter;
					List<Card>played = new ArrayList<Card>();
					ui.showText("...........................................................");
					for (int i = 0; i < 4; ++i) {
						CardPlayer p = getPlayers().get ((starter + i) % 4);
						CardEventTurnToPlay turn = new CardEventTurnToPlay (p);
						turn.setRule (checkRules (hand, round, p, played, suitsPlayed));
						synchronized (p) {
							p.setCardPlayed(null);
							ui.sendEvent (this, turn);
							p.wait ();
						}
						played.add(p.getCardPlayed());
					}
					CardPlayer winner = getPlayers().get (starter);
					Card highCard = winner.getCardPlayed();
					for (int i = 1; i < 4; ++i) {
						CardPlayer p = getPlayers().get ((starter + i) % 4);
						if (highCard.compareTo (p.getCardPlayed()) < 0) {
							winner = p;
							newStarter = (starter + i) % 4;
							highCard = p.getCardPlayed();
						}
					}
					for (Card c: played) {
						suitsPlayed.add(c.getSuit());
					}
					winner.collectTrick (played);
					CardEventEndRound endRound = new CardEventEndRound (winner);
					endRound.setPoints(getCardWithPoints (played));
					ui.sendEvent (this, endRound);
					
					String trick = Card.showCSList (played);
					String points = Card.showCSList (endRound.getPoints());
					String testString = String.format("\t\t[%d, '%s', %d, '%s'],", 
							starter, trick, newStarter, points);
					testCases.add (testString);
					starter = newStarter;
				}
				banner = String.format("==================== Score For Hand %-4d===================", hand);
				CardEventScoreBoard scoreHand = new CardEventScoreBoard (String.format("Score for hand %d", hand));
				ui.showText(banner);
				for (CardPlayer p : getPlayers ()) {
					String ps = updateScore (p);
					ui.showText(ps);
					scoreHand.addLine (ps.substring(0,30).trim());
				}
				ui.showText("...........................................................");
				for (CardPlayerTeam team : teams) {
					int total = 0;
					for (CardPlayer p : team.getPlayers()) {
						total += p.getScore();
					}
					String score = String.format("%24s Team Score %d", team.getName(), total);
					ui.showText(score);
					if (total >= 1000 || total <= -1000) {
						setGameOver(true);
					}
					team.setTeamScore(total);
					scoreHand.addLine (score);
				}
				ui.showText("===========================================================");
				ui.sendEvent(this, scoreHand);
				while (!testCases.isEmpty()) {
					String t = testCases.remove(0);
					System.out.println(t);
				}
				starter = findLastPig();
				ui.showText("===========================================================");
			}
			ui.showText("=======================Game Over!==========================");
			if (teams[0].getTeamScore() > teams[1].getTeamScore()) {
				ui.showText(String.format("%24s %-20s SCORE:%d", "Winning Team", teams[0].getName(), teams[0].getTeamScore()));
				ui.showText(String.format("%24s %-20s SCORE:%d", "Losing Team", teams[1].getName(), teams[1].getTeamScore()));
			}
			else if (teams[1].getTeamScore() > teams[0].getTeamScore()) {
				ui.showText(String.format("%24s %-20s SCORE:%d", "Winning Team", teams[1].getName(), teams[1].getTeamScore()));
				ui.showText(String.format("%24s %-20s SCORE:%d", "Losing Team", teams[0].getName(), teams[0].getTeamScore()));
			}
			else {
				ui.showText(String.format("%24s %-20s SCORE:%d", "Tied Team", teams[0].getName(), teams[0].getTeamScore()));
				ui.showText(String.format("%24s %-20s SCORE:%d", "Tied Team", teams[1].getName(), teams[1].getTeamScore()));
			}
			ui.showText("===========================================================");
		} catch (InterruptedException e) {
		}
		ui.sendEvent (this, new CardEventGameOver());
	}
	private List<Card> getCardWithPoints(List<Card> played) {
		List<Card>points = new ArrayList<Card>();
		for (Card c : played) {
			if (c.isSpecial() || c.getSuit() == Suits.HEARTS) {
				points.add(c);
			}
		}
		return points;
	}
	private int findStarter() {
		for (int i = 0; i < getPlayers().size(); ++i) {
			for (Card c : getPlayers().get(i).getHand()) {
				if (c.isTwoOfClubs()) {
					return i;
				}
			}
		}
		return 0;
	}
	private int findLastPig () {
		for (int i = 0; i < getPlayers().size(); ++i) {
			for (Card c : getPlayers().get(i).getTricks()) {
				if (c.isPig()) {
					return i;
				}
			}
		}
		return 0;
	}
	private CardGameRule checkRules(int hand, int round, CardPlayer p, List<Card> played, Set <Suits> suitsPlayed) {
		List<Card>playerHand = p.getHand();
		CardGameRule rule = new CardGameRule ();
		List<Card>allowed = rule.getAllowed ();
		
		if (played.size() == 0) {
			String s = "Please start the round";
			allowed.addAll(playerHand);
			rule.setExplanation(s);
		}
		else {
			rule.setExplanation("You must follow suit");
			Suits s = played.get(0).getSuit();
			for (Card c : playerHand) {
				if (c.getSuit() == s) {
					allowed.add(c);
				}
			}
			if (allowed.size() == 0) {
				rule.setExplanation("You must discard a card");
				allowed.addAll (playerHand);
			}
		}
		// Can't play any face up's until the suit is broken
		List<Card>saved = new ArrayList<Card>(allowed);
		String savedExplanation = rule.getExplanation ();
		for (Card c : p.getFaceup()) {
			if (!c.isAceOfHearts() && !suitsPlayed.contains(c.suit)) {
				allowed.remove(c);
				String s = rule.getExplanation();
				rule.setExplanation (s + ", "  + c.getSuit().name() + " is not broken");
			}
		}
		if (allowed.isEmpty()) {
		// No options, you may break the suit	
			rule.setAllowed(saved);
			rule.setExplanation(savedExplanation);
		}
		return rule;
	}
	private void waitForPlayerReady() throws InterruptedException {
		synchronized (playerReady) {
			playerReady.wait ();
		}
	}
	public boolean isGameOver() {
		return gameOver;
	}
	public void setGameOver(boolean gameOver) {
		this.gameOver = gameOver;
	}
	public CardDeck getDeck() {
		return deck;
	}
	public void setDeck(CardDeck deck) {
		this.deck = deck;
	}
	private String updateScore(CardPlayer p) {
		String score = "";
		
		int goat = 100;
		int pig = -100;
		int singleM = 25;
		int scaleScore = 2;
		int scaleHearts = 1;
		int scalePig = 1;
		int scaleGoat = 1;
		HashMap<Card.Ranks, Integer>hearts = new HashMap<Card.Ranks, Integer>();
		hearts.put(Card.Ranks.ACE, -50);
		hearts.put(Card.Ranks.KING, -40);
		hearts.put(Card.Ranks.QUEEN, -30);
		hearts.put(Card.Ranks.JACK, -20);
		hearts.put(Card.Ranks.TEN, -10);
		hearts.put(Card.Ranks.NINE, -10);
		hearts.put(Card.Ranks.EIGHT, -10);
		hearts.put(Card.Ranks.SEVEN, -10);
		hearts.put(Card.Ranks.SIX, -10);
		hearts.put(Card.Ranks.FIVE, -10);
		hearts.put(Card.Ranks.FOUR, 0);
		hearts.put(Card.Ranks.THREE, 0);
		hearts.put(Card.Ranks.TWO, 0);
		int points = 0;
		for (List<Card>l : faceUps.values()) {
			for (Card c : l) {
				if (c.isPig()) {
					scalePig = 2;
				}
				else if (c.isGoat()) {
					scaleGoat = 2;	
				}
				else if (c.isAceOfHearts()) {
					scaleHearts = 2;	
				}
				else if (c.isMultiplier()) {
					scaleScore = 4;
				}
			}
		}
		int multiplier = 1;
		List<Card>allHearts = new ArrayList<Card>();
		String hasPig = "";
		String hasGoat = "";
		String hasMultiplier = "";
		String shootTheMoon = "";
		for (Card c : p.getPoints()) {
			if (c.isPig()) {
				hasPig = "<P>";
				points += pig * scalePig;
				score += c;
			}
			else if (c.isGoat()) {
				hasGoat = "<G>";
				points += goat * scaleGoat;
				score += c;
			}
			else if (c.isMultiplier()) {
				hasMultiplier = "<M>";
				multiplier = scaleScore;
				score += c;
			}
			else if (c.getSuit() == Suits.HEARTS) {
				points += hearts.get(c.getRank()) * scaleHearts;
				score += c;
				allHearts.add(c);
			}
		}
		if (allHearts.size() == hearts.size()) {
			points += 400 * scaleHearts;
			shootTheMoon = "<H>";
			if (!hasPig.isBlank() && !hasGoat.isBlank()) {
				score = "SHOOT THE MOON";
			}
		}
		if (!hasMultiplier.isBlank() && hasPig.isBlank() && hasGoat.isBlank() && allHearts.size() == 0) {
			points = singleM;
		}
		points *= multiplier;
		int total = p.getScore() + points;
		score = String.format("%12s (%6d,%6d) %-70s - %s%s%s%s",
				p.displayString(),
				points, 
				total, 
				score,
				hasGoat,
				hasPig,
				shootTheMoon, 
				hasMultiplier);
		p.setScore(total);
		
		return score;
	}
}
