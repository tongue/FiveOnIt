define( ['jquery'], function ( $ ) {
	return {
		addImage: function ( src, callback ) {
			var imageObj = new Image();
			imageObj.onload = function () {
				if ( typeof callback === 'function' ) {
					callback( imageObj );
				}
			};
			imageObj.src = src;
			return imageObj;
		},

		getCoordinates: function ( $canvas, tapX, tapY ) {
			var position = $canvas.offset();
			return {
				x: Math.round( tapX - position.left ),
				y: Math.round( tapY - position.top )
			}
		}
	}
} );