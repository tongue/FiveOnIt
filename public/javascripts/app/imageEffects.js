define( ['jquery'], function ( $ ) {
	return {
		greyscale: function(imageObj, ctx){
			var x = y = 0;
			var imageData = ctx.getImageData(x, y, imageObj.width, imageObj.height);
			var dataCopy = new Uint8ClampedArray(imageData.data);
			var data = imageData.data;

			for(var i = 0; i < data.length; i += 4) {
			  var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
			  data[i] = brightness;
			  data[i + 1] = brightness;
			  data[i + 2] = brightness;
			}
			
			ctx.putImageData(imageData, x, y);
			imageData.data.set(dataCopy);
			return imageData;
		}
	};
} );