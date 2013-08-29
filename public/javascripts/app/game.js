define( ['jquery', 'app/imageHandler', 'mobileevents'], function ( $, ImageHandler ) {
	var Game = function () {
		this.init();
	};

	Game.prototype.init = function () {
		this.canvas = document.getElementById( 'image-map' );
		this.$canvas = $( this.canvas );
		this.context = this.canvas.getContext( '2d' );

		this.create( '/images/pokemons.jpg' );
		this.bind();
	};

	Game.prototype.bind = function () {
		this.$canvas.bind( 'doubletap', $.proxy( this.onDoubleTap, this ) );
	};

	Game.prototype.onDoubleTap = function ( event ) {
		console.log(ImageHandler.getCoordinates( this.$canvas, event.clientX, event.clientY ));
	};

	Game.prototype.create = function ( imageURL ) {
		var that = this;
		this.image = ImageHandler.addImage( imageURL, function ( image ) {
			that.context.drawImage( image, 0, 0 );
			// trigger image loaded
		} );
	};

	return Game;
} );