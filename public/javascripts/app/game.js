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
	'app/timer',
	'app/draw',
	'socketio',
	'mobileevents'
], function ( $, ImageHandler, timer, draw, IO ) {
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
		this.socket = IO.connect( 'http://192.168.8.126:3000' );
		this.$readyScreen = $( '.ready-screen' );

		this.bind();

		setTimeout( $.proxy( this.showConnectScreen, this ), 3000 );
	};

	Game.prototype.bind = function () {
		this.$canvas.on( 'doubletap', $.proxy( this.onDoubleTap, this ) );
		this.$btnConnect.on( 'click', $.proxy( this.onConnectClick, this ) );
		this.$btnReady.on( 'click', $.proxy( this.onReady, this ) );

		this.socket.on( 'preloadGame', $.proxy( this.create, this ) );
		this.socket.on( 'showReady', $.proxy( this.showReady, this ) );
		this.socket.on( 'startGame', $.proxy( this.start, this ) );
		this.socket.on( 'clickCallback', $.proxy( this.onClickResult, this ) );
		this.socket.on( 'GameOver', $.proxy( this.gameOver, this ) );
	};

	Game.prototype.prepareNextObject = function ( nextObject ) {
		this.$canvasScreen.find( '.next-object' ).find( 'img' ).prop( 'src', nextObject );
	};

	// Steps
	Game.prototype.showConnectScreen = function () {
		this.$splash = $( '.splash-screen' );
		this.$connect = $( '.connect' );

		this.switchView( this.$splash, this.$connect );
	};

	Game.prototype.onConnectClick = function ( event ) {
		event.preventDefault();
		this.username = $( '[name="username"]' ).val();
		if ( this.username.length > 0 ) {
			var data = {
				username: this.username
			};
			this.socket.emit( 'joinGame', data );
			this.$btnConnect.addClass( 'hidden' );
			this.switchView( this.$connect, this.$readyScreen );
		}
	};

	Game.prototype.create = function ( gameData ) {
		var that = this;
		this.prepareNextObject( gameData.nextObject );
		this.image = ImageHandler.addImage( gameData.imageUrl, function ( image ) {
			that.context.drawImage( image, 0, 0 );
		} );
	};

	Game.prototype.showReady = function ( ) {
		this.$readyScreen.find('.waiting' ).addClass( this.options.hiddenClass );
		this.$btnReady.removeClass( this.options.hiddenClass );
	};

	Game.prototype.onReady = function ( event ) {
		event.preventDefault();
		this.$btnReady.addClass( 'ready' ).off( 'click' );
		this.socket.emit( 'clientReady', { ready: true } );
	};

	Game.prototype.start = function () {
		var $countDown, that;
		$countDown = $( '.count-down' );
		that = this;

		this.$btnReady.addClass( this.options.hiddenClass );
		$countDown.removeClass( this.options.hiddenClass );
		$countDown.on( 'countdown.complete', function () {
			that.switchView( that.$readyScreen, that.$canvasScreen, $.proxy( that.showNextObject, that ) );
			timer.setCount( 5 );
		} );
		timer.start( $countDown );
	};

	Game.prototype.showNextObject = function () {
		var that = this;
		this.switchView( this.$canvas, this.$canvasScreen.find( '.next-object' ), function () {
			setTimeout( $.proxy( that.showCanvas, that ), 5000 );
		} );
	};

	Game.prototype.showCanvas = function () {
		this.switchView( this.$canvasScreen.find( '.next-object' ), this.$canvas );
	};

	Game.prototype.onDoubleTap = function ( event ) {
		this.socket.emit( 'clientClick', ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ) );
	};

	Game.prototype.onClickResult = function ( data ) {
		if ( data.status ) {
			var that = this;
			draw.drawHit( this.context, data.x, data.y );
			this.prepareNextObject( data.nextObject );
			setTimeout( function() {
				that.showNextObject();
			}, 1000);
		}
	};

	Game.prototype.gameOver = function ( data ) {

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