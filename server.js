var express = require('express'),
		ejs = require('ejs'),
		low = require('lowdb'),
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

app.get('/', function(req, res){
	res.render('index.ejs')
})

app.get('/leaderboard', function(req, res){
	res.render('leaderboard.ejs');
})

app.get('/user/:username', function(req, res){
	res.render('users.ejs', {
		user: db.get('players').find({username: req.params.username}).value(),
		games: db.get('leaderboard').filter({username: req.params.username}).sortBy('time').value(),
	})
})

app.use(express.static(__dirname + '/public/'));

io.on('connection', function (socket) {
  socket.on('startgame', function(data){
		socket.emit("game", {
			p1: {
				x: Math.random()*100,
				y: Math.random()*100,
				score: 0,
			},
			p2: {
				x: Math.random()*100,
				y: Math.random()*100,
				score: 0,
			}
		})
	});
	socket.on('death', function (data) {

  });
  socket.on('redirection', function (data) {

  });
	socket.on('getfruit', function (data) {

  });
	socket.on('disconnect', function(){

	})
	socket.on('getleaderboard', function (data) {

  });
});

server.listen(PORT)
