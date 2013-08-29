
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
var hitCoordinates = 
[
	{HitArea: Rect(399,270,b,h), viewImage: '/images/pok1.png'},
	{HitArea: Rect(115,648,b,h), viewImage: '/images/pok2.png'},
	{HitArea: Rect(572,759,b,h), viewImage: '/images/pok3.png'},
	{HitArea: Rect(1425,162,b,h), viewImage: '/images/pok4.png'},
	{HitArea: Rect(1141,811,b,h), viewImage: '/images/pok5.png'}
];

io.sockets.on('connection', function(socket){

	socket.on('joinGame', function(data)
	{
		clients.push(socket);
		clients[clients.indexOf(socket)].username = data.username;

		clients[clients.indexOf(socket)].points = 0;

		clients[clients.indexOf(socket)].GameRound= [];

		clients[clients.indexOf(socket)].GameRound.push({ HitArea:hitCoordinates[0].HitArea, noClicks: 0});

		socket.emit('preloadGame', 
		{
			nextObject: hitCoordinates[clients[clients.indexOf(socket)].points].viewImage,
			imageUrl: '/images/pokemons.jpg'
		})

		var noClients = clients.length;
		//console.log(clients);
		
		if(noClients >= 2)
		{
			io.sockets.emit('showReady', true);
		}		

	})

	socket.on('clientReady', function(data){
		
		clients[clients.indexOf(socket)].isReady = data.ready;
		
		console.log('client is: ', 
			clients[clients.indexOf(socket)].username, 'and: ', 
			clients[clients.indexOf(socket)].isReady);

		var allIsReady = true;
		clients.forEach(function(index, client){
			if(allIsReady)
				allIsReady = clients[clients.indexOf(socket)].isReady;
		});

		if(allIsReady)
		{
			io.sockets.emit('startGame', { noClients: clients.length} );
			clients[clients.indexOf(socket)].GameRound[0].startTime = new Date().getTime();
		}

	})

	socket.on('disconnect', function(){
		clients.splice(clients.indexOf(socket), 1);
	});


	socket.on('clientClick', function(data)
	{
		var currClient = clients[clients.indexOf(socket)];
		var point = clients[clients.indexOf(socket)].points;

		currClient.GameRound[currClient.points].noClicks += 1;

		var objA = Rect(data.x, data.y, 1, 1);
		var objB = currClient.GameRound[currClient.points].HitArea;

		var hit = detectHit(objA, objB);
		var win = false;
		
		if(hit)// 55 * 55
		{
			currClient.GameRound[point].roundTime = new totalTimeSinceStart(currClient.GameRound[point].startTime);	
			
			clients[clients.indexOf(socket)].points += 1;
			win = (clients[clients.indexOf(socket)].points >= hitCoordinates.length);
		}

		if(!win)
		{
			var callbackObject = {x: data.x, y: data.y, status: hit};
			if(hit)
			{
				
				
				currClient.GameRound.push({HitArea: hitCoordinates[clients[clients.indexOf(socket)].points].HitArea});

				callbackObject.nextObject = hitCoordinates[clients[clients.indexOf(socket)].points].viewImage;

				callbackObject.x = hitCoordinates[clients[clients.indexOf(socket)].points-1].HitArea.x;
				callbackObject.y = hitCoordinates[clients[clients.indexOf(socket)].points-1].HitArea.y;
			}
			socket.emit('clickCallback', callbackObject);
		}
		else
		{
			io.sockets.emit('gameOver', true);
			disconnectAll();
		}
	})
});

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

function disconnectAll() {
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

function endGame(){
	
	io.sockets.emit("endGame",{first:"1", second:"2", third:"3"});
	disconnectAll();
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