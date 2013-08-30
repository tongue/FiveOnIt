/*
 Send:
 joinGame: username
 clientReady: ready (true/false)
 clientClick: x, y

 Recieve:
 preloadGame: imageUrl, nextObject
 showReady
 startGame: noClients (antal klienter)
 clickCallback: status(true/false), x, y, nextObject
 GameOver: clients
 */

define( [
	'jquery',
	'app/imageHandler',
	'socketio',
	'app/timer',
	'mobileevents'
], function ( $, ImageHandler, IO, timer ) {
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
		this.$canvasScreen = $( '.canvas-screen' );
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
//		this.socket.emit( 'clientReady', { ready: true } );
		this.start( {} );
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

	Game.prototype.start = function () {
		var $countDown, that;
		$countDown = $( '.count-down' );
		that = this;

		this.$btnReady.addClass( this.options.hiddenClass );
		$countDown.removeClass( this.options.hiddenClass );
		$countDown.on( 'countdown.complete', function () {
			that.switchView( that.$readyScreen, that.$canvasScreen, $.proxy( that.showNextObject, that ) );
		} );
		timer.start( $countDown );
	};

	Game.prototype.showReadyScreen = function () {
		this.$readyScreen = $( '.ready-screen' );
		this.switchView( this.$connect, this.$readyScreen );
	};

	Game.prototype.showNextObject = function () {
		this.$canvas.addClass( this.options.hiddenClass );
		this.$canvasScreen.find( '.next-object' ).removeClass( this.options.hiddenClass );
	};

	Game.prototype.onClickResult = function ( data ) {

	};

	Game.prototype.gameOver = function ( data ) {

	};

	Game.prototype.onDoubleTap = function ( event ) {
		this.socket.emit( 'clientClick', ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ) );
	};

	Game.prototype.create = function ( gameData ) {
		var that = this;
		this.image = ImageHandler.addImage( gameData.imageUrl, function ( image ) {
			that.context.drawImage( image, 0, 0 );
			// trigger image loaded
		} );
	};

	Game.prototype.prepareNextObject = function(nextObject) {
		// TODO: build the next object
	};

	Game.prototype.switchView = function ( from, to, callback ) {
		var that = this;
		from.fadeOut( this.options.fadeTime, function () {
			from.addClass( that.options.hiddenClass );
			to.hide().removeClass( that.options.hiddenClass ).fadeIn( that.options.fadeTime );
			if ( typeof callback === 'function' ) {
				callback();
			}
		} );
	};

	return Game;
} );