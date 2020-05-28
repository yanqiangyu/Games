// Based on sample mainly from
// https://stackoverflow.com/questions/43163592/standalone-websocket-server-without-jee-application-server
//

package com.ialogic.games.cards.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.ServerSocket;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import java.util.Scanner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WebSocketServer {
	final static String WEB_SOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	WebSocketServer instance;
	ServerSocket server;
	ConcurrentHashMap<String, Session> sessions = new ConcurrentHashMap<String, Session>();
	ServerEventListener listener = null;
	public class Session extends Thread {
		String id;
		Socket client;
		InputStream in;
		OutputStream out;

		public Session(String pid, Socket pclient, InputStream pin, OutputStream pout) {
			this.id = pid;
			this.client = pclient;
			this.in = pin;
			this.out = pout;
		}
		public void send(String msg) throws IOException {
			out.write(encode (msg));
		}
		public String getMessage() throws IOException {
			int len = 0;
			byte[] b = new byte[1024];
			while (true) {
				len = in.read(b);
				if (len == -1) {
					break;
				}
				else {
					byte rLength = (byte) (b[1] & 0x7F);
					int rMaskIndex = 2;
					if (rLength == (byte) 126)
						rMaskIndex = 4;
					if (rLength == (byte) 127)
						rMaskIndex = 10;
					int rDataStart = rMaskIndex + 4;
					int msgLen = len - rDataStart;
					if (msgLen > b.length - rDataStart) {
						// Not worry about large messages for now
						msgLen = b.length - rDataStart;
					}
					byte[] masks = Arrays.copyOfRange (b, rMaskIndex, rDataStart);
					byte[] message = new byte[msgLen];
					for (int i = 0; i < msgLen; i++) {
						message[i] = (byte) (b[rDataStart++] ^ masks[i & 0x03]);
					}
					return new String(message);
				}
			}
			return null;
		}
		public void run() {
			while (!client.isInputShutdown() && !interrupted()) {
				try {
					String msg = getMessage();
					if (msg != null) {
						ServerEventListener l = WebSocketServer.this.listener;
						if (l != null) {
							l.handleWebSocket(id, msg);
						}
					}
					else {
						break;
					}
				} catch (IOException e) {
					log("Client %s exception %s", id, e);
					break;
				}
			}
			WebSocketServer.this.close(id);
		}
	}

	public WebSocketServer(int port) {
		if (instance == null) {
			instance = this;
		}
		try {
			server = new ServerSocket(port);
		} catch (IOException e) {
			log("Can not start server on port %d, exception:$s", port, e.toString());
		}
	}
	public void start() {
		Thread t = new Thread () {
			public void run () {
				Executor e = Executors.newCachedThreadPool();
				log("SERVER: WebSocketServer started on port %d", server.getLocalPort());
				while (true) {
					Socket client;
					try {
						client = server.accept();
						log("Connection received from %s", client.getRemoteSocketAddress());
						e.execute(new Runnable () {
							public void run () { 
								handleSession (client);
							}
						});	
					} catch (IOException e1) {
						log ("Connection broken from %s", e.toString());
						break;
					}
				}
			}
		};
		t.start ();
	}
	public static void log(String fmt, Object... args) {
		System.out.println(String.format(fmt, args));
	}
	private void handleSession(Socket client) {
		String id = client.getRemoteSocketAddress().toString();
		try {
			InputStream in = client.getInputStream();
			OutputStream out = client.getOutputStream();
			handShake(in, out);
			Session s = new Session(id, client, in, out);
			sessions.put(id, s);
			log("Session with client %s, started", id);
			s.start ();
		} catch (IOException e) {
			log("Failed to start session with client %s, exception:$s", id, e.toString());
		}
	}
	public void setListener(ServerEventListener plistener) {
		this.listener = plistener;
	}
	public void send(String id, String msg) throws IOException {
		Session s = getSession (id);
		if (s != null) {
			s.send(msg);
		}
	}
	public boolean isConnected(String id) {
		Session s = getSession (id);
		return s != null && s.client != null && s.client.isConnected();
	}
	public void close(String id) {
		Session s = getSession (id);
		if (s != null && s.client != null) {
			try {
				s.client.close();
				s.out.close ();
				s.in.close();
			} catch (Exception e) {
			}
		}
		sessions.remove(id);
		log("Client %s stopped", id);
	}
	public static byte[] encode(String mess) throws IOException {
		byte[] rawData = mess.getBytes();
		byte[] frame = new byte[10];
		int frameCount = 0;

		frame[0] = (byte) 129;

		if (rawData.length <= 125) {
			frame[1] = (byte) rawData.length;
			frameCount = 2;
		} else if (rawData.length >= 126 && rawData.length <= 65535) {
			frame[1] = (byte) 126;
			int len = rawData.length;
			frame[2] = (byte) ((len >> 8) & (byte) 255);
			frame[3] = (byte) (len & (byte) 255);
			frameCount = 4;
		} else {
			frame[1] = (byte) 127;
			int len = rawData.length;
			frame[2] = (byte) ((len >> 56) & (byte) 255);
			frame[3] = (byte) ((len >> 48) & (byte) 255);
			frame[4] = (byte) ((len >> 40) & (byte) 255);
			frame[5] = (byte) ((len >> 32) & (byte) 255);
			frame[6] = (byte) ((len >> 24) & (byte) 255);
			frame[7] = (byte) ((len >> 16) & (byte) 255);
			frame[8] = (byte) ((len >> 8) & (byte) 255);
			frame[9] = (byte) (len & (byte) 255);
			frameCount = 10;
		}
		int bLength = frameCount + rawData.length;

		byte[] reply = new byte[bLength];

		int bLim = 0;
		for (int i = 0; i < frameCount; i++) {
			reply[bLim] = frame[i];
			bLim++;
		}
		for (int i = 0; i < rawData.length; i++) {
			reply[bLim] = rawData[i];
			bLim++;
		}
		return reply;
	}

	private void handShake(InputStream inputStream, OutputStream outputStream) throws UnsupportedEncodingException {
		@SuppressWarnings("resource")
		String data = new Scanner(inputStream, "UTF-8").useDelimiter("\\r\\n\\r\\n").next();
		Matcher get = Pattern.compile("^GET").matcher(data);
		if (get.find()) {
			Matcher match = Pattern.compile("Sec-WebSocket-Key: (.*)").matcher(data);
			match.find();

			byte[] response = null;
			try {
				response = ("HTTP/1.1 101 Switching Protocols\r\n" + "Connection: Upgrade\r\n"
						+ "Upgrade: websocket\r\n" + "Sec-WebSocket-Accept: "
						+ Base64.getEncoder()
								.encodeToString(MessageDigest.getInstance("SHA-1")
										.digest((match.group(1) + WEB_SOCKET_GUID).getBytes("UTF-8")))
						+ "\r\n\r\n").getBytes("UTF-8");
				outputStream.write(response, 0, response.length);
			} catch (NoSuchAlgorithmException | IOException e) {
				e.printStackTrace();
			}
		} else {
			throw new UnsupportedEncodingException("Handshake failed - GET not found");
		}
	}
	public Session getSession(String id) {
		if (id != null) {
			return sessions.get(id);
		}
		return sessions.values().iterator().next();
	}
	public static void main(String[] args) {
		WebSocketServer s = new WebSocketServer (8012);
		s.setListener(new ServerEventListener() {
			public void handleWebSocket(String id, String message) {
				try {
					s.send(id, "Echo:" + message);
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		});
		s.start ();
	}
}
