/*
 Send:
 joinGame: username
 clientReady: ready (true/false)
 clientClick: x, y

 Recieve:
 preloadGame: imageUrl
 showReady
 startGame: noClients (antal klienter)
 clickCallback: status(true/false), x, y
 GameOver: clients
 */

define( ['jquery', 'app/imageHandler', 'socketio', 'mobileevents'], function ( $, ImageHandler, io ) {
	var Game = function () {
		this.init();
	};

	Game.prototype.init = function () {
		this.canvas = document.getElementById( 'image-map' );
		this.$canvas = $( this.canvas );
		this.context = this.canvas.getContext( '2d' );
		this.socket = io.connect('http://localhost:3000');

		this.socket.emit( 'joinGame', { username: 'Johan' } );

		this.bind();
	};

	Game.prototype.bind = function () {
		this.$canvas.bind( 'doubletap', $.proxy( this.onDoubleTap, this ) );
		this.socket.on('preloadGame', $.proxy( this.create, this ));
		this.socket.on('showReady', $.proxy( this.showReadyButton, this ));
		this.socket.on('startGame', $.proxy( this.start, this ));
		this.socket.on('clickCallback', $.proxy( this.onClickResult, this));
		this.socket.on('GameOver', $.proxy( this.gameOver, this ));
	};

	Game.prototype.start = function ( event ) {

	};

	Game.prototype.showReadyButton = function ( data ) {
		this.socket.emit('clientReady', { ready: true });
	};

	Game.prototype.onClickResult = function ( data ) {

	};

	Game.prototype.gameOver = function ( data ) {

	};

	Game.prototype.onDoubleTap = function ( event ) {
		window.console.log(ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ));
		this.socket.emit('clientClick', ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ));
	};

	Game.prototype.create = function ( gameData ) {
		var that = this;
		window.console.log(gameData);
		this.image = ImageHandler.addImage( gameData.imageUrl, function ( image ) {
			that.context.drawImage( image, 0, 0 );
			// trigger image loaded
		} );
	};

	return Game;
} );