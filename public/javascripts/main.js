require.config( {
	paths: {
		'jquery': 'vendor/jquery',
		'underscore': 'vendor/underscore',
		'mobileevents': 'plugins/jquery.mobile-events',
	},

	shim: {
		'jquery': {
			exports: "$"
		},
		'socketio': {
			exports: "io"
		},
		'mobileevents': {
			deps: ["jquery"]
		}
	}
} );

require( ['jquery', 'underscore', 'app/game'], function ( $, _, Game ) {
	$( function () {
		var game = new Game();
	} );
} );