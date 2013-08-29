
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
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


var clients = [];

io.sockets.on('connection', function(socket){

	socket.on('joinGame', function(data)
	{
		clients.push(socket);
		clients[clients.indexOf(socket)].username = data.username;

		
		socket.emit('preloadGame', 
		{
			imageUrl: 'http://thinkprogress.org/wp-content/uploads/2013/01/Google-300x168.jpg'
		})

		
		var noClients = clients.length;
		console.log(clients);
		
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
			io.sockets.emit('startGame', { noClients: clients.length } )

	})

	socket.on('disconnect', function(){
		clients.splice(clients.indexOf(socket), 1);
	});


	socket.on('clientClick', function(data)
	{
		var hit = detectHit(data.coordinates, clients[clients.indexOf(socket)].hitArea);
		var win = false;
		
		if(hit)
		{
			clients[clients.indexOf(socket)].points += 1;
			win = (clients[clients.indexOf(socket)].points > 4);
		}

		if(!win)
		{
			if(hit)
			{
				clients[clients.indexOf(socket)].points += 1;
			}
			var callbackObject = {x = 0, y = 0};

			socket.emit('clickCallback', callbackObject);
		}
		else
			io.sockets.emit('gameOver', clients);
	})
});

function detectHit(coord, rect) {
  return !(
        ((a.y + a.h) < (b.y)) ||
        (a.y > (b.y + b.h)) ||
        ((a.x + a.w) < b.x) ||
        (a.x > (b.x + b.w))
    );
}
function Rect(x,y,w,h){
this.x = x;
this.y = y;
this.w = w;
this.h = h;

}