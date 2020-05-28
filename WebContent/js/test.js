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
var testState = "Test_Login";
var testStage = 0;
var testUsers = ['Steve', 'Ying','Chris','Tiff'];
var testHand = "6C,8C,KC,2D,5D,XD,3H,7H,8H,2S,5S,7S,XS";
var testFaceups = ["","","","JD"];
var testGame = [
		[0, '2D,QD,3D,8D', 1, ''],
		[1, 'XC,2C,AC,KC', 3, 'XC'],
		[3, 'KD,5D,4D,9D', 3, ''],
		[3, 'AH,7H,6H,2H', 3, '2H,6H,7H,AH'],
		[3, 'JC,6C,4C,QC', 2, ''],
		[2, 'JS,QS,5S,3S', 3, 'QS'],
		[3, '6D,XD,AD,5C', 1, ''],
		[1, 'JH,4H,5H,3H', 1, '3H,4H,5H,JH'],
		[1, 'KS,AS,8S,7S', 2, ''],
		[2, 'KH,QH,8H,XH', 2, '8H,XH,QH,KH'],
		[2, '9S,4S,2S,6S', 2, ''],
		[2, '9H,7D,8C,7C', 2, '9H'],
		[2, '3C,JD,XS,9C', 1, 'JD'],
];
var testScoreBoard = 

{
    "event": "CardEventScoreBoard",
    "message": "Score for hand 8",
    "player_list": [
        {
            "name": "Steve",
            "points": ""
        },
        {
            "name": "Chris",
            "points": "JD,3H,4H,5H,JH"
        },
        {
            "name": "Ying",
            "points": "8H,9H,XH,QH,KH"
        },
        {
            "name": "Tiff",
            "points": "XC,2H,6H,7H,AH,QS"
        }
    ],
    "lines": [
        "Steve,Chris,Ying,Tiff",
        "0,170,-100,-340",
        "1,-160,110",
        "2,-260,-90",
        "3,-140,-320",
        "4,-290,-320",
        "5,-560,-200",
        "6,-780,-340",
        "7,-900,-420",
        "8,-1000,-590"
    ],
    "faceup": "JD"
}


function testStart () {
	for (i = 0; i < testScoreBoard.player_list.length; ++i ) {
		testUsers[i] = testScoreBoard.player_list[i].name;
	}
	testThread = setInterval(testLoop, testThreadInterval);
	return "Waiting for test cases...";
}

function isTesting () {
	return testThread != null;
}

function testLoop () 
{
	if (eventQueue.length > 0) {
		return;
	}
	var testResponse= {
			event:'CardEventGameIdle',
			message: "testState: " + testState + ", stage:" + testStage
		};
	
	switch (testState) {
	case "Test_Login":
		testResponse= {
			event:'CardEventLoginAck',
			message: "Welcome",
			player: {
				name: testUsers[0],
				position: 2
			},
			status: "OK"
		};
		testState = "Test_Idle";
		break;
	case "Test_Reconnect":
		if (testStage == 0) {
			testResponse = null; // TODO
		}
		else if (testStage > 3) {
			testState = "Test_EndHand";
		}
		++testStage;
		break;
	case "Test_Idle":
		++testStage;
		if (testStage == 1) {
			testResponse= {
				event: 'CardEventGameIdle',
				message: "Waiting for Players"
			}
		}
		else if (testStage < 5) {
			var i = testStage - 1;
			testResponse= {
				event:'CardEventPlayerRegister',
				message: "New Player: " + testUsers[testStage-1],
				player_list: [
					{
						name: testUsers[i],
						position: ((i+2)%4)
					}
				]
			};
		}
		else {
			testResponse= {
				event:'CardEventShuffleEffect',
				message: "Shuffling Cards ",
			};
			testState = "Test_DealCard";
		}
		break;
	case "Test_DealCard":
			testResponse= {
				event:'CardEventDealCards',
				message: "Dealing Cards",
				player: { 
					name: testUsers[0],
					position: 2,
					hand: testHand
				}
			};
			testStage = 0;
			testState = "Test_Negotiate";
			break;
	case "Test_Negotiate":
			testResponse= {
				event:'CardEventFaceUp',
				message: "Choose Cards or Pass",
				rule: { 
					reason: "Special card only",
					allowed: "AH,QS,XC,JD"
				}
			};
			testState = "Test_FaceUpResponse";
			break;
	case "Test_FaceUpResponse":
		if (testFaceups.length > 0) {
			var card = testFaceups.shift();
			var p = (testStage + 3 + 1) % 4;
			testResponse= {
				event:'CardEventFaceUpResponse',
				message: "Player Face Up",
				player: { 
					name: testUsers[p]
				},
				card_played: card
			};
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
				testResponse= {
					event:'CardEventTurnToPlay',
					message: testUsers[p] + "'s turn to play",
					player: { 
						name: testUsers[p]
					},
					rule: {
						reason: "Test Only",
						allowed: card
					}
				};
				if (p == 0) {
					testState = "Test_PlayerTurnResponse";
				}
				++testStage;
			}
			else {
				if (p != 0) {
					testResponse= {
						event:'CardEventPlayerAction',
						message: testUsers[p] + " played card",
						player: { 
							name: testUsers[p],
						},
						card_played: card
					};
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
		testResponse= {
			event:'CardEventEndRound',
			message: "Round Ended",
			player: { 
				name: testUsers[p],
			},
			points_this_round: points
		};
		testState = "Test_PlayerReady";
		break;
	case "Test_EndHand":
		testStage = 0;
		testResponse = testScoreBoard;
		testState = "Test_End";
		break;
	case "Test_End":
		prompt ("Test End");
		testStage = 0;
		clearInterval (testThread);
		break;
	default:;
	}
	var text = JSON.stringify(testResponse)
	eventQueue.push (text);
}