/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 *
 *
 *
 *
 */
(function ( mod ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) // CommonJS, Node
		module.exports = mod( require('express') );
	else if (typeof define == "function" && define.amd) // AMD
		return define([ "express" ], mod);
	else // normal browser env
		this.gpuPlot = mod( express )();

})(function ( express ) {
	
	// "use strict"; // TODO benchmarks to see whether strict is actually faster
	// "use asm";

	function WebGLPlot () {

		this.app = express();
		this.app.set('views', __dirname + '/public/templates/' );
		this.app.set('view engine', 'jade');
		this.app.engine( 'jade', require('jade').__express );
		this.app.use( express.static( __dirname + '/public/') );

		this.app.get('/', function ( req, res ) {
			res.render('index')
		});
		this.app.listen( 3000 );

	};

	WebGLPlot.prototype = {
		plot : function ( data ) {

		}
	};




	// // exit handler
	// this.exitDefer = Q.defer();
	// this.nwprocess.on('exit', function ( code, signal ) {
	// 	this.exitDefer.resolve({ "code" : code, signal : signal });
	// }.bind(this));

	// io.sockets.on('connection', function ( socket ) {

	// 	socket.on('message', function( data, callback ) {
	// 		callback(this.data)
	// 	}.bind(this))

	// }.bind(this));

	return new WebGLPlot
});