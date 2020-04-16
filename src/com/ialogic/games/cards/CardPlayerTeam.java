package com.ialogic.games.cards;

import java.util.ArrayList;
import java.util.List;

public class CardPlayerTeam {
	List<CardPlayer> players = new ArrayList<CardPlayer>();
	int teamScore;
	public String getName() {
		String name = "(";
		String s = "";
		for (CardPlayer p : getPlayers()) {
			name += s + p.getName();
			s =" ";
		}
		name +="): ";
		return name;
	}
	public List<CardPlayer> getPlayers() {
		return players;
	}
	public void setPlayers(List<CardPlayer> players) {
		this.players = players;
	}
	public int getTeamScore() {
		return teamScore;
	}
	public void setTeamScore(int teamScore) {
		this.teamScore = teamScore;
	}
}
