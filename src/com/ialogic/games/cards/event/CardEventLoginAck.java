package com.ialogic.games.cards.event;

public class CardEventLoginAck extends CardEvent {
	String status;
	String code;
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public CardEventLoginAck(String message) {
		super(message);
	}
	public String getXMLString() {
		String response = String.format("<event name='%s'><status>%s</status>" + 
				"<player name='%s' code='%s' position='%d'/>" +
				"<message>%s, %s!</message></event>", 
				this.getClass().getSimpleName(), 
				getStatus(),
				getPlayer() == null ? "" : getPlayer().getName(), 
				getCode (),
				getPlayer() == null ? 0 : getPlayer().getPosition(), 
				getPlayer() == null ? "" : getPlayer().getName(), 
				getMessage());
		return response;
	}
}
