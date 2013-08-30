define( function () {
	var count = 5,
			element,
			counter;

	var timer = function () {
		count = count - 1;
		if ( count <= 0 ) {
			clearInterval( counter );
			element.trigger('countdown.complete');
			return;
		}
		element.text( count );
	};

	return {
		start: function ( $element ) {
			element = $element;
			counter = setInterval( timer, 1000 );
		},
		setCount: function ( countVal ) {
			count = countVal;
		}
	};
} );