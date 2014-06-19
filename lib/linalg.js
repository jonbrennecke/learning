/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 */

var TypeLibrary = Object.freeze({
	"int8" : Int8Array,
	"uint8" : Uint8Array,
	"int16" : Int16Array,
	"uint16" : Uint16Array,
	"int32" : Int32Array,
	"uint32" : Uint32Array,
	"float32" : Float32Array,	
	"float64" : Float64Array,	
}); 

function _isArray ( array ) {
	return Object.prototype.toString.call( array ) === '[object Array]'
}

function _isTypedArray ( array ) {
	for ( var type in TypeLibrary ) {
		if ( Object.prototype.toString.call( array ) === TypeLibrary[type]().toString() )
			return true
	}
	return false
}


function _flatten ( array2D ) {

	var l = array2D.length * array2D[0].length,
		z = (function (a,b) { while (b--){ a[b] = 0; } return a })([],l)

	for ( var i = 0; i < l; i++ ) {
		z[i] = array2D[ Math.round(i/l) ][ i%array2D[0].length ];
	}

	return z
}


/**
 *
 * 1D typed vector object
 *
 */

function vec ( data, type ) {
	this.type = ( type && TypeLibrary[type] ) ? type : "float64";

	if ( _isArray( data ) || _isTypedArray(data) ) {	
		this._buffer = TypeLibrary[ this.type ]( data )
	}
};

vec.prototype = {

	get x () {
		return this.get(0);
	},

	get y () {
		return this.get(1);
	},

	get z () {
		return this.get(2);
	},

	get length () {
		return this._buffer.length
	},

	get : function ( k ) {
		return this._buffer[k]
	},

	map : function ( callback ) {
		return Array.prototype.map.call( this._buffer, callback );
	},

	/**
	 *
	 * vec.slice(begin[, end])
	 *
	 */
	slice : function ( begin, end ) {
		return new vec( this._buffer.slice( begin, end ), this.type )
	}

};



/**
 *
 * 2D typed matrix object
 *
 */

function matrix ( data, type ) {

	this._shape = [ data.length, data[0].length ];
	this.transposed = false;
	this._vector = new vec( _flatten( data ), type );

};


matrix.prototype = {

	get : function ( a, b ) {
		return this._vector.get( this.transposed ? a * this.shape[0] + b : a * this.shape[1] + b )
	},

	get type () {
		return this._vector.type;
	},

	get shape () {
		return this.transposed ? this._shape.reverse() : this._shape
	},

	// 1D element-wise map over array
	$map : function ( callback ) {
		return this._vector.map( callback );
	},

	/**
	 *
	 * 2D map over matrix
	 *
 	 * syntax: callback([ thisArg, val, index, vec ])
	 * 
	 */
	map : function ( a, b, c ) {
		
		var start = _isArray( a ) ? a : [0,0],
			end = _isArray( b ) ? b : this.shape,
			callback;

		if ( ! [a,b,c].some( function ( val ) {
			if ( val && typeof val === "function" ) {
				callback = val;
				return true
			}
		} ) ) {
			throw new TypeError( "map requires a callback function as a paramater." );
		}

		var slice = this._vector.slice( start[0] * this.shape[0] + start[1], end[0] * this.shape[0] + end[1] );

		for (var i = 0; i < slice.length; i++) {
			callback.call( this, slice.get(i), [
				(start[0]+i)%this.shape[1], 
				Math.round((start[1]+i)/(this.shape[0]*this.shape[1]))
				], slice)
		};	
	},

	// return a 2D array
	toArray : function () {

		
		

	},

	toString : function () {
		
		// var str = "[";

		// for ( var i = 0; i < this.shape[0]; i++ ) {
		// 	for ( var j = 0; j < this.shape[1]; j++ ) {
		// 		this.get(i,j)
		// 	}
		// }

		return this.toArray()

		// return Array.prototype.toString.call( this.toArray )

		// return str + "]";
	},

	T : function () {
		this.transposed = !this.transposed;
	},

	// TODO respect transposed
	reshape : function ( m, n ) {
		this.shape[0] = m;
		this.shape[1] = n;
	}

};


module.exports = {

	TypeLibrary : TypeLibrary,
	vec : vec,
	matrix : matrix,

};