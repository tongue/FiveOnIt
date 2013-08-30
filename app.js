
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/client', routes.client);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


var clients = [];
var b = 55;
var h = 55;
var GAME_ON = false;
var GAME_RUNTIME_SECONDS = 60*5;
var hitCoordinates = 
[
	{HitArea: Rect(399,270,b,h), viewImage: '/images/pok1.png'},
	{HitArea: Rect(115,648,b,h), viewImage: '/images/pok2.png'},
	{HitArea: Rect(572,759,b,h), viewImage: '/images/pok3.png'},
	{HitArea: Rect(1425,162,b,h), viewImage: '/images/pok4.png'},
	{HitArea: Rect(1141,811,b,h), viewImage: '/images/pok5.png'}
	//{HitArea: Rect(0,0,b,h), viewImage: '/images/pok5.png'}
];

io.sockets.on('connection', function(socket){

	socket.on('joinGame', function(data)
	{
		clients.push(socket);
		clients[clients.indexOf(socket)].username = data.username;

		clients[clients.indexOf(socket)].points = 0;
		clients[clients.indexOf(socket)].totalClicks = 0;

		clients[clients.indexOf(socket)].totalTime = 0;

		clients[clients.indexOf(socket)].GameRound= [];

		clients[clients.indexOf(socket)].GameRound.push({ HitArea:hitCoordinates[0].HitArea, noClicks: 0});

		socket.emit('preloadGame', 
		{
			nextObject: hitCoordinates[clients[clients.indexOf(socket)].points].viewImage,
			imageUrl: '/images/pokemons.jpg'
		})

		var noClients = clients.length;
		console.log(noClients);
		if(noClients > 1)
		{
			if(!GAME_ON)
				io.sockets.emit('showReady', true);
			else
				socket.emit('error', { msg: 'Unable to connect to active game'});
		}		

	})

	socket.on('clientReady', function(data){
		
		clients[clients.indexOf(socket)].isReady = data.ready;
		
		var allIsReady = true;
		
		clients.forEach(function(client){
			if(allIsReady)
				allIsReady = client.isReady;
		});

		if(allIsReady)
		{
			GAME_ON = true;
			io.sockets.emit('startGame', { noClients: clients.length} );
			startTime = new Date();
			startTime.setSeconds(startTime.getSeconds() + 5);
			startTime = startTime.getTime();
			clients.forEach(function(client)
			{
				client.GameRound[0].startTime = startTime;
			});

			//timer(GAME_RUNTIME_SECONDS, endGame);
		}

	})

	socket.on('clientClick', function(data)
	{
		var currClient = clients[clients.indexOf(socket)];
		console.log('client Click: ', currClient);
		if(!currClient) return;

		var point = currClient.points;

		currClient.totalClicks += 1;
		currClient.GameRound[currClient.points].noClicks += 1;

		var objA = Rect(data.x, data.y, 1, 1);
		var objB = currClient.GameRound[currClient.points].HitArea;

		console.log('HitTest IN:', data, objA);
		console.log('HitTest Compare: ', objB);
		var hit = detectHit(objA, objB);
		var win = false;
		
		if(hit)// 55 * 55
		{
			var roundTime = totalTimeSinceStart(currClient.GameRound[point].startTime);
			currClient.totalTime += roundTime
			currClient.GameRound[point].roundTime = roundTime;
			
			currClient.points += 1;
			win = (currClient.points >= hitCoordinates.length);
		}


		var callbackObject = {x: data.x, y: data.y, status: hit};
		if(hit)
		{
			if(!win)
			{
				currClient.GameRound.push({HitArea: hitCoordinates[currClient.points].HitArea});
				callbackObject.nextObject = hitCoordinates[currClient.points].viewImage;
			}
			callbackObject.x = hitCoordinates[currClient.points-1].HitArea.x;
			callbackObject.y = hitCoordinates[currClient.points-1].HitArea.y;
		}

		socket.emit('clickCallback', callbackObject);
		reportPointChanges();

		if(win)
		{
			endGame();
		}
	})

	
	function endGame(){
		console.log('EndGame -> GAME_ON:', GAME_ON);
		if(GAME_ON)
		{
			GAME_ON = false;
			io.sockets.emit('gameOver', getScoarboard());
			disconnectAll();
		}
	}

	socket.on('greyScaleWeaponReceive', function(){
		console.log('server received weapon event');
		io.sockets.broadcast.emit('greyScaleWeaponReceive');
	});



	socket.on('disconnect', function(){
		console.log('CLIENT DISCONNECTED');
		clients.splice(clients.indexOf(socket), 1);
	});

});

	function reportPointChanges()
	{
		console.log('Reporting Change in scoreboard');

		io.sockets.emit('scoreChange', getScoarboard());
	}


function disconnectAll() {
	console.log("DISCONNECT ALL")
	var rooms = io.sockets.manager.rooms;
	var users;
	for(var i = 0;i<rooms.length; i++){
		users = rooms[i];
		for(var j = 0; j < users.length; j++) {
			io.sockets.socket(users[i]).disconnect();
		}
	}
    return this;
};

function timer(timeInSeconds, endCallback){
	var interval = setInterval(function(){
		clearInterval(interval);
		endCallback();
	},timeInSeconds * 1000);

}

function getScoarboard()
{
	var scoreboard = [];
	clients.forEach(function(client)
	{
		scoreboard.push(
				{
					nick: client.username, 
					points: client.points, 
					totalTime: client.totalTime, 
					totalClicks: client.totalClicks
				});
	});
	
	var sortedBoard = scoreboard.sort(function(a,b) 
		{ 
			if(a.points > b.points)
				return -1;
			else if(a.points < b.points)
				return 1;

			if(a.totalTime < b.totalTime)
				return -1;
			if(a.totalTime > b.totalTime)
				return 1;
			return 0;
		} );

	return scoreboard;
}

function detectHit(a, b) {
  return !(
        ((a.y + a.h) < (b.y)) ||
        (a.y > (b.y + b.h)) ||
        ((a.x + a.w) < b.x) ||
        (a.x > (b.x + b.w))
    );
}
function Rect(x,y,w,h){ return {
x : x,
y : y,
w : w,
h : h}
}


// ropa på den här när vi vill få
function totalTimeSinceStart(start){
    return new Date().getTime() - start;


}
function formatTime(milliseconds){
    var seconds = Math.floor(milliseconds /1000)
    var rest = milliseconds - seconds*1000;
    
    return seconds + "'" + rest;
    
}
// tid att jämföra mellan spelarna


//var ms = totalTimeSinceStart(start);
// tid att visa på highscore
//var formattedTime = formatTime(ms);