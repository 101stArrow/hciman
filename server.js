var express = require('express'),
	ejs = require('ejs'),
	low = require('lowdb'),
	rc = require('randomcolor'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io')(server);

var PORT = 3005;
var db = low('db.json');

db.get('ingame').remove().write()

db.defaults({
	players: [],
	leaderboard: [],
	ingame: [],
	champion: {}
}).write()

app.get('/', function (req, res) {
	res.render('index.ejs')
})

app.get('/server', function (req, res) {
	res.render('server.ejs')
})

app.get('/leaderboard', function (req, res) {
	res.render('leaderboard.ejs');
})

app.get('/user/:username', function (req, res) {
	res.render('users.ejs', {
		user: db.get('players').find({
			username: req.params.username
		}).value(),
		games: db.get('leaderboard').filter({
			username: req.params.username
		}).sortBy('time').value(),
	})
})

app.use(express.static(__dirname + '/public/'));

io.on('connection', function (socket) {
	socket.on('startgame', function (data) {
		console.log("starting game")
		gameObj = {
			players: [],
			map: genMap(data.height, data.width),
			height: data.height,
			width: data.width,
			size: data.size,
			gameid: makeid(5),
			server: socket.id
		}
		db.get('ingame').push(gameObj).write()
		socket.emit("game", gameObj)
		socket.gamesession = {
			usertype: "server",
			game: gameObj.gameid
		}
	});
	socket.on('joingame', function (data) {
		socket.gamesession = {
			usertype: "player",
			server: data.server
		}
		gameObj = db.get('ingame').find({gameid: data.server}).value()
		if(!gameObj){
			socket.emit('news', {'title':'error', 'message': "Cannot find server"})
		} else {
			gameObj.players.push({
				username: data.user,
				color: rc.randomColor({ luminosity: 'light', format: 'rgb' }),
				x: Math.floor(Math.random()*gameObj.width),
				y: Math.floor(Math.random()*gameObj.height),
				ammo: 0
			})
			db.get('ingame').find({gameid: data.server}).assign(gameObj).write();
			// emit("game", gameObj);
			io.sockets.connected[gameObj.server].emit("game", gameObj)
		}
	});
	socket.on('death', function (data) {

	});
	socket.on('move', function (data) {
		gameObj = db.get('ingame').find({gameid: socket.gamesession.server}).value()
		gameObj.players.forEach(function(e){
			if(e.username == data.player){
				//Found user
				console.log(e)
				px = Math.floor(e.x * gameObj.size)
				py = Math.floor(e.y * gameObj.size)
				switch (data.action){
					case 'up':
						if(gameObj.map[e.x * e.y-1] == "wall"){
							break;
						} else {
							e.y += -1
							break;
						}
						break;
					case 'right':
						if(gameObj.map[e.x+1 * e.y] == "wall"){
							break;
						} else {
							e.x += 1
							break;
						}
						break;
					case 'down':
						if(gameObj.map[e.x * e.y+1] == "wall"){
							break;
						} else {
							e.y += 1
							break;
						}
						break;
					case 'left':
						if(gameObj.map[e.x-1 * e.y] == "wall"){
							break;
						} else {
							e.x += -1
							break; 
						}
						break;
				}
				if(gameObj.map[e.x * e.y] == "ammo"){
					e.ammo++
					gameObj.map[e.x * e.y] = false
				}
			}
		});
		io.sockets.connected[gameObj.server].emit("game", gameObj)
	});
	socket.on('shoot', function (data) {

	});
	socket.on('disconnect', function () {
		gameObj = db.get('ingame').find({server: socket.id}).value()
		if(gameObj){
			db.get('ingame').remove({server: socket.id}).write()
		} else {

		}
	})
	socket.on('getleaderboard', function (data) {

	});
});

function genMap(height, width) {
	var map = []
	for (h = 0; h < height - 1; h++) {
		for (w = 0; w < width - 1; w++) {
			chance = Math.random()
			if (chance > 0.97) {
				map.push("ammo")
			} else if (chance > 0.85) {
				map.push("wall")
			} else {
				map.push(false)
			}
		}
	}
	return map
}

function makeid(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

server.listen(PORT)