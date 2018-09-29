timer = new Timer();
socketSource = null
websocket = null

function loadPlay(wsource) {
	socketSource = wsource
	console.log('Loaded game page.')
	var game = 'New Game'
	var container = 'game_container'
	startWait(container)
}


function startWait(container) {
	registerPlayer(container, null)
}

function registerPlayer(container, dataSource) {
	if ('WebSocket' in window){
		console.log('WebSocket is available in the platform!')
	   /* WebSocket is supported. You can proceed with your code*/
	} else {
		alert('WebSocket is NOT available!')
	   /*WebSockets are not supported. Try a fallback method like long-polling etc*/
	}
	websocket = new WebSocket(socketSource);
	websocket.onopen = function(){
		console.log("Socket has been opened!");
		document.getElementById('con_connecting').className = 'hidden_indicator'
		document.getElementById('con_wait_for_match').className = ''
		sendMessage('register', 'Hola')
	}
	websocket.onerror = function (error) {
	  console.log('WebSocket Error ' + error);
	  console.log(error);
	};
	websocket.onclose = function() {
		console.log("closed");
	};
	websocket.onmessage = function (event) {
	  console.log(event.data);
	  var messageObj = JSON.parse(event.data)
	  var messageType = messageObj.messageType
	  var messageBody = messageObj.messageBody
	  console.log(messageObj)
	  console.log('recieved message: [messageType: ' + messageType + ', messageBody: ' + messageBody + ']')
	  if(messageType == 'start_game'){
	  	console.log('Started Game!')
	  	localStorage.clear()
	  	storeData("puzzle_data", messageBody)
	  	storeData("container", container)
	  	loadPuzzle(container, dataSource)
	  	timer.start();
	  	timer.addEventListener('secondsUpdated', function (e) {
		    document.getElementById("timer_text").innerHTML = timer.getTimeValues().toString()
		});
	  	document.getElementById('con_wait_for_match').className = 'hidden_indicator'
	  	document.getElementById('ongoing_game_timer').className = ''
	  } else if(messageType == 'end_game'){
	  	var hours = messageBody.time.hours
	  	var minutes = messageBody.time.minutes
	  	var seconds = messageBody.time.seconds
	  	timer.stop()
	  	var end_time = hours + ':' + minutes + ':' + seconds
	  	addLog(messageBody)
	  	var message = 'VICTORY in ' + end_time
	  	if(!messageBody.this_winner){
	  		message = 'You lost, they finished in ' + end_time
	  	}
	  	document.getElementById('ongoing_game_timer').className = 'hidden_indicator'
	  	document.getElementById('final_message').className = ''
	  	document.getElementById("final_message_text").innerHTML = message
	  	websocket.close()
	  }
	}
	// websocket.send(JSON.stringify({
	// 	name: 'Hola Dola',
	// 	message: 'Hola Lala'
	// }));
	// websocket.onmessage = function(evt) {
 //    console.log(evt.data)
// };
}

function sendMessage(messageType, messageBody) {
	var msg = JSON.stringify({"messageType": messageType, "messageBody": messageBody})
	console.log('sending message to server: ' + msg)
	websocket.send(msg)
}

function onCompleteGame(){
	hours = timer.getTimeValues().hours;
    minutes = timer.getTimeValues().minutes;
    seconds = timer.getTimeValues().seconds;
	timer.stop()
	addLog('Executing completion callback...')
	//tell server that game completed..
	time_taken = timer
	messageBody = {
		"hours": hours,
		"minutes": minutes,
		"seconds": seconds
		}
	sendMessage('game_completed', messageBody)
}