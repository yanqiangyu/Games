//*******************************************************************************
// Test Code Functions:
// This is client side only test code to validate 
// 1. XML parsing
// 2. Animation effects
// 3. Event handlers.
// It does not try to validate state transition from server side. 
//*******************************************************************************
var testThread=null;
var testThreadInterval = 1000;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];
var testState = "Test_Login";
var testStage = 0;
var testHand="3C,4C,5C,8C,7D,AD,5H,XH,JH,QH,AH,5S,9S";
var testFaceups = ["XC,QS", '',"JD"];
var testGame = [
	[2, '6D,XD,AD,2D', 0, ''],
	[0, 'XH,6H,2H,7H', 0, '2H,6H,7H,XH'],
	[0, '5H,4S,4H,9H', 3, '4H,5H,9H'],
	[3, '2C,8C,9C,QC', 2, ''],
	[2, '3H,4D,AH,8S', 0, '3H,AH'],
	[0, 'QH,XC,KH,6S', 2, 'XC,QH,KH'],
	[2, '8H,7C,JH,QD', 0, '8H,JH'],
	[0, '4C,6C,3D,AC', 3, ''],
	[3, '2S,9S,XS,AS', 2, ''],
	[2, '9D,KD,7D,7S', 3, ''],
	[3, '8D,3C,KC,5D', 3, ''],
	[3, 'KS,5S,QS,3S', 3, 'QS'],
	[3, 'JD,5C,JC,JS', 3, 'JD'],
];
var testScore = [
	"Steve,Ying,Chris,Tiff",
	"180,0,-1120,0",
	"1,-480,-160",
	"2,-840,-380",
	"3,-1780,-380"
]

var testPoints = [
	"2H,3H,9H,XH,JD,4H",
	"",
	"QS,KH,8H,XC,AH,5H,6H,7H,QH,JH",
	""
]

function testStart () {
	testThread = setInterval(testLoop, testThreadInterval);
	return "Waiting for test cases...";
}

function testLoop () 
{
	var testResponse=
		"<event name='CardEventGameIdle'>" +
		"<message>testState: " + testState + ", stage:" + testStage + "</message>" +
		"</event>";
	
	switch (testState) {
	case "Test_Login":
		testResponse=
			"<event name='CardEventLoginAck'>" +
			"<message>Welcome</message>" +
			"<player name='" + testUsers[0] + "' position='2'/>" +
			"<status>OK</status>" +
			"</event>";
		testState = "Test_Idle";
		break;
	case "Test_Reconnect":
		if (testStage == 0) {
			testResponse = 
				"<event name='CardEventPlayerReconnect'><message>Welcome back!</message>" +
					"<player name='" + testUsers[0] + "' position='2' points='4H'><hand>XC,4D,5D,6D,7D,5H,XH,QS,4S</hand><faceup>XC</faceup><cardPlayed card='NA'/></player>" +
					"<player name='" + testUsers[1] + "' position='3' points='9H'><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup>JD</faceup><cardPlayed card='4C'/></player>" + 
					"<player name='" + testUsers[2] + "' position='0' points='3H,5H'><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup>AH</faceup><cardPlayed card='2C'/></player>" +
					"<player name='" + testUsers[3] + "' position='1' points=''><hand>NA,NA,NA,NA,NA,NA,NA,NA</hand><faceup></faceup><cardPlayed card='3C'/></player>";
			testResponse = testResponse + "</event>";
		}
		else if (testStage > 3) {
			testState = "Test_EndHand";
		}
		++testStage;
		break;
	case "Test_Idle":
		++testStage;
		if (testStage == 1) {
			testResponse=
				"<event name='CardEventGameIdle'>" +
				"<message>Waiting for Players</message>" +
				"</event>";
		}
		else if (testStage < 5) {
			var i = testStage - 1;
			testResponse=
				"<event name='CardEventPlayerRegister'>" +
				"<message>New Player: " + testUsers[testStage-1] + "</message>";
			testResponse = testResponse + 
				"<player name='" + testUsers[i] + "' position='" + ((i+2)%4) + "' />"; 
			testResponse = testResponse + "</event>";
		}
		else {
			testResponse=
				"<event name='CardEventShuffleEffect'>" +
				"<message>Shuffling Cards</message>";
				testResponse = testResponse + "</event>";
			testState = "Test_DealCard";
		}
		break;
	case "Test_DealCard":
		testResponse=
			"<event name='CardEventDealCards'>" +
			"<message>Dealing Cards</message>" +
				"<player name='Steve'>" +
				"<hand>" + testHand + "</hand>" +
				"</player>";
			testResponse = testResponse + "</event>";
			testState = "Test_Negotiate";
			break;
	case "Test_Negotiate":
		testResponse=
			"<event name='CardEventFaceUp'>" +
			"<message>Choose Cards or Pass</message>" + 
			"<rule reason='Special card only' allowed='AH,QS,XC,JD'/>";
			testResponse = testResponse + "</event>";
			testStage = 0;
			testState = "Test_FaceUpResponse";
			break;
	case "Test_FaceUpResponse":
		if (testFaceups.length > 0) {
			var card = testFaceups.shift();
			var p = (testStage + 3 + 2) % 4;
			testResponse=
				"<event name='CardEventFaceUpResponse'>" +
				"<message>Player Face Up</message>" + 
				"<player name='" + testUsers[p] + "'>" +
				"<faceup>" + card + "</faceup>" +
				"</player>";
			testResponse = testResponse + "</event>";
			++testStage;
		}
		else {
			testStage = 0;
			testState = "Test_EndTurn";
		}
		break;
	case "Test_EndTurn":
		if (testFaceups.length > 0) {
			testState = "Test_FaceUpResponse";
		}
		else {
			testState = "Test_PlayerReady";
		}
		break;
	case "Test_PlayerReady":
		if (testStage > 103) {
			testState="Test_EndHand";
		}
		else {
			var turn = Math.floor (testStage/2);
			var step = turn % 4;
			var r = Math.floor (turn / 4);
			var start = testGame[r][0];
			var p = (turn + start) % 4;
			var card = testGame[r][1].split(",")[step];
			
			if ((testStage % 2) == 0) {
				testResponse=
					"<event name='CardEventTurnToPlay'>" +
					"<message>" + testUsers[p] + "'s turn to play</message>" + 
					"<player name='" + testUsers[p] + "'>" +
					"</player>" +
					"<rule reason='Test Only' allowed='" + card + "'/>";
				testResponse = testResponse + "</event>";
				if (p == 0) {
					testState = "Test_PlayerTurnResponse";
				}
				++testStage;
			}
			else {
				if (p != 0) {
					testResponse=
						"<event name='CardEventPlayerAction'>" +
						"<message>" + testUsers[p] + " played card</message>" + 
						"<player name='" + testUsers[p] +"'>" +
						"<cardPlayed card='" + card + "'/>" +
						"</player>";
					testResponse = testResponse + "</event>";
				}
				if (step == 3) {
					testState = "Test_EndRound";
				}
				++testStage;
			}
		}
		break;
	case "Test_PlayerTurnResponse":
		testState = "Test_PlayerReady";
		break;
	case "Test_EndRound":
		var turn = Math.floor ((testStage-1)/2);
		var r = Math.floor (turn / 4);
		var p = testGame[r][2];
		var points = testGame[r][3];
		testResponse=
			"<event name='CardEventEndRound'>" +
			"<message>Round Ended</message>" +
			"<player name='" + testUsers[p] +
				"' points='" + points +
				"'>" +
			"</player>";
		testResponse = testResponse + "</event>";
		testState = "Test_PlayerReady";
		break;
	case "Test_EndHand":
		testStage = 0;
		testResponse=
			"<event name='CardEventScoreBoard'>" +
			"<message>Score for Test Hand</message>\n";
			for (i = 0; i < testPoints.length; ++i) {
				testResponse += "<player name='" + testUsers[i] + 
					"' points='" + testPoints[i] + "' />\n";
			}
			for (i = 0; i < testScore.length; ++i) {
				testResponse += "<line>" + testScore[i] + "</line>\n";
			}
			testResponse += "<faceup>";
			var sep = ""
			for (i = 0; i < testFaceups.length; ++i) {
				if (testFaceups[i] != "") {
					testResponse += sep + testFaceups[i];
					sep = ",";
				}
			}
			testResponse += "</faceup>";
		testResponse = testResponse + "</event>";
		testState = "Test_End";
		break;
	case "Test_End":
		prompt ("Restarting hand");
		testStage = 5;
		testState = "Test_Idle";
		break;
	default:;
	}
	eventQueue.push (testResponse);
}