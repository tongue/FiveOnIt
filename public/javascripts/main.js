require.config( {
	paths: {
		jquery: 'vendor/jquery',
		underscore: 'vendor/underscore'
	}
} );

require( ['jquery', 'underscore'], function ( $, _ ) {
	$(function() {
		window.console.log('Document Ready');
	});
} );