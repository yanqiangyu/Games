package com.ialogic.games.cards;
import java.util.ArrayList;
import java.util.List;

public class CardGameRule {
	List<Card> allowed = new ArrayList<Card>();;
	String explanation;
	
	public List<Card> getAllowed() {
		return allowed;
	}
	public void setAllowed(List<Card> allowed) {
		this.allowed = allowed;
	}
	public String getExplanation() {
		return explanation;
	}
	public void setExplanation(String explanation) {
		this.explanation = explanation;
	}
}
