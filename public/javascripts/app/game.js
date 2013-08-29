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

define( ['jquery', 'app/imageHandler', 'socketio', 'mobileevents'], function ( $, ImageHandler, IO ) {
	var Game = function () {
		this.options = {
			hiddenClass: 'hidden',
			fadeTime: 300
		};

		this.init();
	};

	Game.prototype.init = function () {
		this.canvas = document.getElementById( 'image-map' );
		this.$canvas = $( this.canvas );
		this.context = this.canvas.getContext( '2d' );
		this.$btnConnect = $( '#connect' );
		this.$btnReady = $( '#ready' );
		this.socket = IO.connect( 'http://localhost:3000' );

		this.bind();

		setTimeout( $.proxy( this.showConnectScreen, this ), 3000 );
	};

	Game.prototype.bind = function () {
		this.$canvas.on( 'doubletap', $.proxy( this.onDoubleTap, this ) );
		this.$btnConnect.on( 'click', $.proxy( this.onConnectClick, this ) );
		this.$btnReady.on( 'click', $.proxy( this.onReady, this ) );

		this.socket.on( 'preloadGame', $.proxy( this.create, this ) );
		this.socket.on( 'showReady', $.proxy( this.showReadyScreen, this ) );
		this.socket.on( 'startGame', $.proxy( this.start, this ) );
		this.socket.on( 'clickCallback', $.proxy( this.onClickResult, this ) );
		this.socket.on( 'GameOver', $.proxy( this.gameOver, this ) );
	};

	Game.prototype.showConnectScreen = function () {
		this.$splash = $( '.splash-screen' );
		this.$connect = $( '.connect' );

		this.switchView( this.$splash, this.$connect );
	};

	Game.prototype.onReady = function ( event ) {
		event.preventDefault();
		this.$btnReady.addClass( 'ready' ).off( 'click' );
	};

	Game.prototype.onConnectClick = function ( event ) {
		event.preventDefault();
		this.username = $( '[name="username"]' ).val();
		if ( this.username.length > 0 ) {
			var data = {
				username: this.username
			};
//			this.socket.emit( 'joinGame', data );
			this.$btnConnect.addClass( 'hidden' );
			this.showReadyScreen();
		}
	};

	Game.prototype.start = function ( event ) {

	};

	Game.prototype.showReadyScreen = function () {
		this.$readyScreen = $( '.ready-screen' );
		this.switchView( this.$connect, this.$readyScreen );
	};

	Game.prototype.onClickResult = function ( data ) {

	};

	Game.prototype.gameOver = function ( data ) {

	};

	Game.prototype.onDoubleTap = function ( event ) {
		window.console.log( ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ) );
		this.socket.emit( 'clientClick', ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ) );
	};

	Game.prototype.create = function ( gameData ) {
		var that = this;
		window.console.log( gameData );
		this.image = ImageHandler.addImage( gameData.imageUrl, function ( image ) {
			that.context.drawImage( image, 0, 0 );
			// trigger image loaded
		} );
	};

	Game.prototype.switchView = function ( from, to ) {
		var that = this;
		from.fadeOut( this.options.fadeTime, function () {
			from.addClass( that.options.hiddenClass );
			to.hide().removeClass( that.options.hiddenClass ).fadeIn( that.options.fadeTime );
		} );
	};

	return Game;
} );