var fs = require('fs'),
	Q = require('q');

/**
 *
 * Parse EDF file information based on the EDF/EDF+ specs
 * ---
 * :see 
 *		- http://www.edfplus.info/specs/index.html
 *
 * :param path - file path
 * :param callback - assynchronous function called with header information
 *
 */
function Reader ( path ) {

	this.path = path;
	var headerDefer = Q.defer();

	// open the file and read the header information into an object
	fs.open( path, 'r', function ( err, fd ) {
		if ( err )
			headerDefer.reject(err);

		// the first part of the header is 256 bytes of basic file information
		var buffer = new Buffer(256);
		fs.read( fd, buffer, 0, 256, null, function ( err, bytesRead, buffer ) {
			if ( err )
				headerDefer.reject(err);

			var data = buffer.toString('utf-8', 0, bytesRead), 
			re = /\s+$/,
			__header = {
				version : data.slice(0,8).replace(re,''),
				patientId : data.slice(8,88).replace(re,''),
				recId : data.slice(88,168).replace(re,''),
				startDate : data.slice(168,176).replace(re,''),
				startTime : data.slice(176,184).replace(re,''),
				headerBytes : +data.slice(184,192).replace(re,''),
				numItems : +data.slice(236,244).replace(re,''),
				dataDuration : +data.slice(244,252).replace(re,''),
				numSignals : data.slice(252,256).replace(re,'')|0,
			};

			// advance to the second part of the header
			// which is numSignals * 256 bytes
			var buffer = new Buffer( __header.numSignals * 256 );
			fs.read( fd, buffer, 0, buffer.length, null, function ( err, bytesRead, buffer ) {
				if ( err )
					headerDefer.reject(err)

				var data = buffer.toString('utf-8',0,bytesRead),
					lengths = [ 16, 80, 8, 8, 8, 8, 8, 80, 8, 32 ],
					keys = [ 'labels', 'transducer', 'dimension', 'physMin', 'physMax',
						'digMin', 'digMax', 'prefiltering', 'numSamples' ],
					start = 0;

				lengths.forEach( function ( l, i ) {
					__header[ keys[i] ] = [];
					for (var a = [], j = 1; j < __header.numSignals + 1; j++) {
						__header[ keys[i] ].push( data.slice( start, start + l ).replace(re,'') );
						start += l; 
					}
				});

				// finally, pass the header along to the deferred handle
				headerDefer.resolve( __header );
			});
		});
	});

	// set the Promise objects as properties
	this.header = headerDefer.promise;
};

Reader.prototype = {

	/**
	 *
	 * :return - a Q promise that resolves with the header information
	 */
	getHeader : function () {
		return this.header;
	},

	/**
	 *
	 * :return - a Q promise that resolves with the channel information in a typed array of 16 bit integers
	 */
	getChannel : function ( index ) {

		var dataDefer = Q.defer();

		this.header.then( function ( header ) {

			// open the file and read the header information into an object
			fs.open( this.path, 'r', function ( err, fd ) {
				if ( err )
					dataDefer.reject( err );

				var buffer = new Buffer( 2 * +header.numSamples[index] );
				
				var start = header.numSamples.slice(0,index).reduce(function ( p, c ) {
					return p + +c;
				},0);

				fs.read(fd, buffer, 0, buffer.length, 256+buffer.numSignals*256+start, function ( err, bytesRead, buffer ) {
					if ( err )
						throw err;

					var data = new Int16Array( bytesRead / 2 );

					for (var i = 0; i < data.length; i++)
						data[i] = buffer.readInt16LE(i*2);	
				
					// finally, resolve with the header and data array in an object
					dataDefer.resolve( { header : header, data : data } );
				});
			});
		}.bind(this))

		return dataDefer.promise;
	}
};

module.exports = {
	Reader : Reader
}