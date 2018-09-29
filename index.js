var WebSocketServer = require("ws").Server,
		express = require("express"),
		http = require("http"),
		app = express(),
		server = http.createServer(app),
		players = {};

const path = require('path')
const PORT = process.env.PORT || 5000
const service_endpoint = 'https://puzzlr4u.herokuapp.com/api/'
// const service_endpoint = 'http://localhost:8080/api/'
const wsource = 'wss://puzzlrweb.herokuapp.com/warzone'
// const wsource = 'ws://localhost:5000/warzone'

function sendGameData(user_index, ws, player) {
	http.get(service_endpoint + 'newpuzzle/3/30', (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			game_data = JSON.parse(data)
			console.log(game_data);
			var message = JSON.stringify({
				"messageType": "start_game",
				"messageBody": game_data
			});
			var waiting_user_name = 'user_' + (user_index - 1)
			console.log('waiting_user_name: ' + waiting_user_name)
			var competetor_client = players[waiting_user_name].client
			player['competitor'] = waiting_user_name
			players[player.name] = player
			console.log(player)
			console.log(players[player.name])
			var comp_copy = players[waiting_user_name]
			comp_copy['competitor'] = player.name
			players[waiting_user_name] = comp_copy
			console.log('competetor user name: ' + waiting_user_name)
			ws.send(message);
			competetor_client.send(message)
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});

	
}

function sendEndGameMsg(client, winner_user, hours, minutes, seconds) {
	var this_winner = (winner_user == client.user_name)
	msg = {
		"messageType": "end_game",
		"messageBody": {
			"winner": winner_user,
			"this_winner": this_winner,
			"time": {
				"hours": hours,
				"minutes": minutes,
				"seconds": seconds
			}
		}
	}
	client.send(JSON.stringify(msg))
}

function endGame(end_stats, ender) {
	var winner_user = ender.user_name
	console.log('winner: ' + winner_user)
	var loser_user = players[winner_user].competitor
	console.log('loser: ' + loser_user)
	var hours = end_stats['hours']
	console.log('hours: ' + hours)
	var minutes = end_stats['minutes']
	console.log('minutes: ' + minutes)
	var seconds = end_stats['seconds']
	console.log('seconds: ' + seconds)
	var loser = players[loser_user].client
	sendEndGameMsg(ender, winner_user, hours, minutes, seconds)
	sendEndGameMsg(loser, winner_user, hours, minutes, seconds)
}

const wss = new WebSocketServer({ server: server, path: '/warzone'});

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
		var msgObject = JSON.parse(message)
		var messageType = msgObject.messageType
		if(messageType == 'register'){
			// var user_name = msgObject.messageBody
			var user_index = Object.keys(players).length + 1
			var user_name = 'user_' + user_index
			console.log('registering user: ' + user_name)
			player = {
				client: ws,
				name: user_name,
				time: (new Date()).getTime()
			};
			players[user_name] = player
			ws.user_name = user_name
			if(user_index % 2 == 0){
				sendGameData(user_index, ws, player)
			}
		} else if(messageType == 'game_completed') {
			endGame(msgObject.messageBody, ws)
		}
		console.log('players: ')
		console.log(players)
	});

	ws.on('close', function() {
			console.log('Closed a Connection: ' + ws.user_name);
			delete players[ws.user_name]
			console.log('players: ')
			console.log(players)
		});

});

app
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', (req, res) => res.render('pages/index'))
	.get('/solve', (req, res) => res.render('pages/puzzle/solve', {puzzleDataSource3: service_endpoint + 'newpuzzle/3/30',
																puzzleDataSource4: service_endpoint + 'newpuzzle/4/80'}))
	.get('/play', (req, res) => res.render('pages/puzzle/play', {wsource: wsource}))

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))


