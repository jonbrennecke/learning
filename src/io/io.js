/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 *
 * File I/O and parsing objects
 * ---
 *
 */

(function ( mod ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) // CommonJS (like Node)
		module.exports = mod(require('fs'),require('q'));
	else if (typeof define == "function" && define.amd) // AMD
		return define(["fs","q"], mod);
	else // normal browser env
		this.io = mod( fs, Q )();

})(function ( fs, Q ) {


	/**
	 *
	 * text parser base class
	 * this class shouldn't be instantiated directly; use one of the inheriting classes instead
	 *
	 */
	function Parser () {};

	Parser.prototype = {};


	/**
	 *
	 * inherits from Parser
	 *
	 * :param headersV - number of vertical headers (OPTIONAL)
	 * :param headersH - number of horizontal headers (OPTIONAL)
	 *
	 */
	function CSV ( text, hRows, hCols ) {
		if (!(this instanceof CSV)) {
			return new CSV( text, hRows, hCols );
		}

		var body = [];

		// remove trailing carriage returns and newlines from the beginning 
		// and end of the file
		text
		.replace(/^[\r\n]+|[\r\n]+$/g,'')
		.split(/\r\n?|\n/).forEach( function ( line ) {
			body.push(line.split(/\t/))
		});

		// parse the body information with what we know about where the headers
		// should be located

		this.headers = {};
		this.data = [];

		if ( hRows )
			this.headers.rows = body.slice(0, hRows );

		if ( hCols ) {
			this.headers.cols = [];
			( hRows ? body.slice( hRows ) : body )
				.map( function ( row ) {
					this.headers.cols.push(row.slice(0,hCols))
				}.bind(this))
		}

		if ( !hCols && !hRows )
			this.data = body;
		else {
			( hRows ? body.slice( hRows ) : body )
			.map( function ( row ) {
				this.data.push( hCols ? row.slice(hCols) : 0)
			}.bind(this))
		}

		Parser.call(this);
	};
	CSV.prototype = Object.create( Parser.prototype );


	/**
	 *
	 * import a UTF8 encoded file
	 *
	 */
	function txt ( path ) {
		if (!(this instanceof txt)) {
			return new txt( path );
		}

		this.path = path;
		this.stream = fs.createReadStream( 
			path, { 
				flags: 'r',
				encoding: 'utf8',
				fd: null,
				mode: 0666,
				autoClose: true }
			);
	};

	txt.prototype = {

		/**
		 * asynchronously read a file
		 *
		 * :param done - callback called with the entire file
		 * :param progress - callback called with chunks of the file as the file is read 
		 */
		read : function ( done, progress ) {

			var file = '';

			var ondata = Q.defer();
			this.stream.on('readable', function () {
				var chunk;
				while (null !== (chunk = this.stream.read())) {
					file += chunk;
				    ondata.notify(chunk)
				}
			}.bind(this));

			this.stream.on('end', function () {
				ondata.resolve(file);
			});

			ondata.promise.then( done, null, progress ).done(function ( err ) { if ( err ) throw err });

			return this
		},

	};

	return {
		txt : txt,
		CSV : CSV
	}
});