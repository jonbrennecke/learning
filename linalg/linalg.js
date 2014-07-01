/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 *
 * TODO ndarray
 * TODO id - identity
 *
 */

var _ = require('underscore');

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


/**
 * we have 'isArray' from underscore, but Javascript also supports typed arrays.
 * _isTypedArray searches TypeLibrary for a match. 
 *
 * :return boolean
 *
 */
function _isTypedArray ( array ) {
	for ( var type in TypeLibrary ) {
		if ( Object.prototype.toString.call( array ) === TypeLibrary[type]().toString() )
			return type
	}
	return false
}


/**
 *
 * flatten a MxN 2D array into a 1D array that has length M^N
 *
 * TODO extend this to ND and add to class ndArray
 *
 */
function _flatten ( array2D ) {

	var l = array2D.length * array2D[0].length,
		z = (function (a,b) { while (b--){ a[b] = 0; } return a })([],l)

	for ( var i = 0; i < l; i++ ) {
		z[i] = array2D[ Math.floor(i/l) ][ i%array2D[0].length ];
	}

	return z
}


/**
 *
 * Deep copy of an N-dimensional array
 *
 * :param array - array to clone
 *
 */
function deepcopyND ( array ) {
	return array.map( function ( val ) {
		if ( _.isArray(val) && _.isArray(val[0]) )
			return sliceND(val);
		else return _.isArray(val) ? val.slice() : val
	});
}

// return the dimension of an array or number 'a' as a scalar value.
function dim ( a, i ) {
	return _.isArray(a) ? dim(a[0], (i||0)+1) : (i||0)
}


/**
 * return a Matrix with a 1D vector 'v' in the inner diagonal
 * --
 * 
 */
function diag ( v, l ) {
	var s = _.isArray(v) ? v.length : l,
		m = new Matrix( ndarray( [ s, s ] ) );
	for (var i = 0; i < s; i++) {
		m.set(i,i, _.isArray(v) ? v[i] : v );
	};
	return m;
}


/**
 *
 * autovivify an N-dimensional array with 'value' (value is duplicated by deep copy, so that
 * array elements remain unique)
 *
 * :param dim - array of dimensions, eg. if dim is [3,6,8] the returned array will be 3x6x8
 *
 */
function ndarray ( dim, value, array ) {
	dim = dim.slice(0)
	return (function ( i, v, a ) { 
		while (i--)
			a[i] = _.isObject(v) ? ( _.isArray(v) ? deepcopyND(v) : _.extend({},v) ) : (v || 0); 
		return dim.length ? ndarray(dim,a,[]) : a 
	})(dim.pop(), value, array || [])
};

/**
 *
 * generate a random 1D Matrix with length n, with min 'min' 
 *
 * :param n - length of the returned vector
 * :param min - (optional) minimum value (default is 0)
 * :param max - (optional) maximum value (default is 1)
 * :param type - (optional) data type of the returned vector
 *
 */
function rand ( n, min, max, type ) {
	var m = new Matrix( n, type ),
	min = ! _.isNumber(min) || _.isNaN(min) ? 0 : min,
	max = ! _.isNumber(max) || _.isNaN(max) ? 1 : max;

	for (var i = 0; i < n; i++)
		m.set( 0, i, Math.random() * (max - min) + min );
	return m;
}


/**
 * return a new Matrix of zeros
 *
 * :param n - n can be a number or an array of dimensions
 *
 */
function zeros ( n ) {
	return new Matrix(ndarray( _.isNumber(n) ? [n] : n ,0))
}


/**
 *
 * 1D optionally-typed buffer object
 * ---
 * :param data - array (typed or otherwise) of data, or a scalar value indicating 
 * 		how many elements the buffer will contain
 * 
 * :param type - a type which is a key from TypeLibrary
 *		if no type is given, type is assumed to be 'float64'
 *
 */

function MatrixDataBuffer ( data, type ) {

	// determine the type of the data
	if ( ! type || typeof type != 'string' || ! TypeLibrary.hasOwnProperty(type) )
		this.type = _isTypedArray(data) || 'float64';
	else
		this.type = type;

	// set the buffer
	if ( _.isArray( data ) || typeof data === 'number' )
		this._buffer = TypeLibrary[ this.type ]( data )
	else if ( _isTypedArray(data) )
		this._buffer = data;
	else
		new SyntaxError();
};

MatrixDataBuffer.prototype = {

	get length () {
		return this._buffer.length
	},

	get : function ( k ) {
		return this._buffer[k]
	},

	set : function ( k, val ) {
		this._buffer[k] = val;
		return this._buffer[k]
	},

	map : function ( callback ) {
		var vec = new MatrixDataBuffer( this.length, this.type )
		for (var i = 0; i < this.length; i++) {
			vec.set( i, callback.call( this, this.get(i), i, this ) );
		};
		return vec
	},

	/**
	 *
	 * reduce applies a callback function against an accumulator and
	 * each value of the array (from left-to-right) must reduce it to a single value.
	 *
	 */
	reduce : function ( callback, start ) {
		var a = start || 0;
		for (var i = 0; i < this.length; i++) {
			a = callback.call( this, a, this.get(i), i, this );
		}
		return a;
	},

	/**
	 * return a new MatrixDataBuffer
	 *
	 * vec.slice(begin[, end])
	 *
	 */
	slice : function ( begin, end ) {
		return new MatrixDataBuffer( this._buffer.slice( begin, end ), this.type )
	},

};



function LinalgError ( message ) {
	this.message = message;
 	this.stack = Error().stack; 
}
LinalgError.prototype = Object.create( Error.prototype );  
LinalgError.prototype.name = "LinalgError";



/**
 *
 * 2D typed matrix object
 * -- 
 * :param data - 2D array of data
 * :param type - a type which is a key from TypeLibrary
 *		if no type is given, type is assumed to be 'float64'
 *
 */

function Matrix ( data, type ) {

	var d = dim(data);
	if ( d === 1 ) {
		this._shape =  [ 1, data.length ];
		this._vector = new MatrixDataBuffer( data, type );
	}
	else if ( d > 1 ) {
		this._shape =  [ data.length, data[0].length ];
		this._vector = new MatrixDataBuffer( _flatten( data ), type );
	}
	else {
		this._shape = [ 1, data ];
		this._vector = new MatrixDataBuffer( data, type );
	}

	this.transposed = false;

};


Matrix.prototype = {

	/**
	 * 
	 * The type attribute returns the type of the matrix
	 * where 'type' is a member of TypeLibrary
	 *
	 */
	get type () {
		return this._vector.type;
	},

	/**
	 *
	 * The shape attribute returns the dimensions of the matrix.
	 * If M has n rows and m columns, then M.shape is [n,m]
	 *
	 */
	get shape () {
		return this.transposed ? this._shape.slice(0).reverse() : this._shape;
	},

	/**
	 * reshape to s[0] rows and s[1] columns
	 * 
	 */
	set shape ( s ) {
		this._shape = [ s[0], s[1] ];
	},

	get rows () {
		return this.shape[0];
	},

	get cols () {
		return this.shape[1];
	},

	/**
	 *
	 * The length attribute returns the number of elements in a matrix
	 *
	 */
	get length () {
		return this.shape[0] * this.shape[1];
	},

	getRow : function ( i ) {
		var row = new Matrix(this.cols,this.type)
		for (var j = 0; j < this.cols; j++)
			row.set(0,j,this.get(i,j));
		return row;
	},

	getCol : function ( i ) {
		var col = new Matrix(this.rows,this.type)
		for (var j = 0; j < this.cols; j++)
			col.set(0,j,this.get(j,i));
		return col;
	},

	/**
	 * 
	 * get the element of the matrix in the row a, column b
	 *
	 */
	get : function ( a, b ) {
		if ( ! _.isUndefined(b) && ( a >= this.shape[0] || b >= this.shape[1] ) )
			return undefined
		else {
			return !_.isUndefined(b) ? this._vector.get( 
				this.transposed ? b * this.shape[0] + a : a * this.shape[1] + b ) : this._vector.get(a);
		}
	},

	/**
	 * 
	 * set the element of the matrix in the row a, column b
	 *
	 */
	set : function ( a, b, val ) {
		if ( a >= this.shape[0] || b >= this.shape[1] )
			return false
		else
			return this._vector.set( this.transposed ? b * this.shape[0] + a : a * this.shape[1] + b, val )
	},

	map : function ( callback ) {
		var m = new Matrix( this.length, this.type );
		m.shape = this.shape;
		this.forEach( function ( val, i ) {
			m.set( i[0], i[1], callback.call(this,val,i) )
		});
		return m;
	},

	/**
	 *
	 * execute callback on each element of the matrix
	 * 
	 * :param callback - function to execute on each matrix element,
	 * 		- called as : callback( thisArg, element, index ) 
	 */
	forEach : function ( callback ) {
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++)
				callback.call( this, this.get(i,j), [i,j]);
		};	
		return this;
	},

	iterRows : function ( callback ) {
		for (var i = 0; i < this.rows; i++) {
			var row = this._vector.slice(this.cols*i,this.cols*(i+1));
			callback.call(this,row,i,this)
		};
	},

	iterCols : function ( callback ) {

		for (var i = 0; i < this.cols; i++) {
			
			// create and fill a column
			var col = new Matrix(this.rows,this.type)
			for (var j = 0; j < this.rows; j++)
				col.set(0,j,this.get(j,i))

			// pass it to the callback function
			callback.call(this,col,i,this)
		};
	},

	reduceRows : function ( callback ) {
		var m = new Matrix( this.rows, this.type );
		this.iterRows( function ( row, i ) {
			m.set(0,i, callback.call( this, row, i));
		});
		return m;
	},

	reduceCols : function ( callback ) {
		var m = new Matrix( this.cols, this.type );
		this.iterCols( function ( col, i ) {
			m.set(0,i, callback.call( this, col, i));
		});
		return m;
	},

	// return a 2D array
	toArray : function () {
		return ndarray([this.rows,0],[]).map( function ( a, i ) {
			this.getRow(i).forEach( function ( b ) {
				a.push(b)
			});
			return a
		}.bind(this));
	},

	/**
	 * reduce applies a callback function against an accumulator and
	 * each value of the array (from left-to-right) has to reduce it to a single value.
	 *
	 */
	reduce : function ( callback, start ) {
		this.forEach(function ( val, i ) {
			start = callback.call(this,(start||0),val,i,this)
		});
		return start
	},

	norm : function () {
		// alternatively: return sqrt(this.clone().T().dot(this))
		return Math.sqrt(this.reduce(function ( prev, cur, i ) {
			return prev + cur * cur;
		}));
	},

	T : function () {
		this.transposed = !this.transposed;
		return this;
	},

	clone : function () {
		var m = new Matrix( ndarray(this.shape),this.type);
		m.transposed = this.transposed;
		this.forEach( function ( val, i ) {
			m.set(i[0],i[1], val);
		});
		return m;
	},

	/**
	 *
	 * return the vector divided by x
	 *
	 */
	div : function ( x ) {
		if ( _.isNumber(x) ) 
			return this._divScalar(x)
	},

	_divScalar : function ( x ) {
		return this.map(function ( val ) {
			return val / x
		})
	},

	sub : function ( b ) {
		// if ( _.isNumber(x) ) 
		// TODO
		if ( b instanceof Matrix )
			return this._subMatrix( b )
	},

	_subMatrix : function ( m ) {

		// check dimensions
		if ( this.shape[0] != m.shape[0] && this.shape[1] != m.shape[1] )
			throw new LinalgError( "dimensions must be the same." );

		return this.map( function ( val, i ) {
			return val - m.get(i[0],i[1])
		});
	},

	mul : function ( b ) {
		if ( b instanceof Matrix )
			return this._mulMarix(b);
		if ( _.isNumber( b ) )
			return this._mulScalar(b);
	},

	_mulScalar : function ( s ) {
		return this.map( function ( val ) {
			return val * s
		});
	}, 

	/**
	 * multiplies matricies if the columns of the first matrix are equal in length 
	 * to the rows in the second
	 *
	 */
	_mulMarix : function ( m ) {
		if ( this.cols == m.rows ) {
			return this.reduceRows(function ( row, i ) {
				return m.getRow( i ).reduce(function ( prev, cur, j ) {
					return prev + cur * row.get(j[1]);
				});
			});
		}
		else if ( this.rows == m.cols ) {
			return this.reduceCols(function ( col, i ) {
				return m.getCol( i ).reduce(function ( prev, cur, j ) {
					return prev + cur * col.get(j[1]);
				});
			});
		}
		else throw new LinalgError("The matrix dimensions must agree.");
	},

	// given two equal length vectors
	// unlike multiply, returns a single number
	dot : function ( v ) {
		return this.reduce(function ( prev, cur, i ) {
			return prev + cur * v.get(i[1])
		});
	}

};


module.exports = {

	TypeLibrary : TypeLibrary,
	LinalgError : LinalgError,
	Matrix : Matrix,
	ndarray : ndarray,
	zeros : zeros,
	rand : rand,
	diag : diag

};