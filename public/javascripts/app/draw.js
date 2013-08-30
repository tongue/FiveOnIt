define( ['jquery'], function ( $ ) {
	return {
		drawHit: function( context, x, y ) {
			var dimension = 55;
			context.beginPath();
			context.globalAlpha = 0.5
			context.rect(x, y, dimension, dimension);
			context.fillStyle = 'green';
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();
			
		}
	}
} );