/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 *
 *
 * SVD (Singular Value Decomposition)
 * ---
 * compute the SVD (Singular Value Decomposition) of a matrix A, 
 * which is the same as finding the eigenvalues of the tridiagonalized
 * symmetric matrix T, constructed by the Lanczos algorithm. 
 * ---
 * see 
 *		- http://en.wikipedia.org/wiki/Singular_value_decomposition
 *		- http://arxiv.org/abs/1007.5510
 *
 */


(function ( mod ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) // CommonJS, Node
		module.exports = mod(require('underscore'),require( __dirname + "/../linalg/linalg" ));
	else if (typeof define == "function" && define.amd) // AMD
		return define(["underscore", __dirname + "/../linalg/linalg"], mod);
	else // normal browser env
		this.svd = mod( _, linalg )();

})(function ( _, linalg ) {
	
	// "use strict"; // TODO benchmarks to see whether strict is actually faster
	"use asm";
	

	// computational accuracy
	var EPSILON = 1e-7;

	/**
	 * Lanczos Algorithm
	 * ---
	 * 
	 * for an mxn matrix A, returns a symmetric mxm tridiagonalized matrix T with the
	 * same eigenvalues as A.
	 *
	 * ---
	 * see 
	 *		- http://en.wikipedia.org/wiki/Lanczos_iteration
	 *		- http://en.wikipedia.org/wiki/Singular_value_decomposition
	 *		- http://bickson.blogspot.com/2011/10/lanczos-algorithm-for-svd-singule-value.html
	 *
	 * :param A - a square or rectangular matrix
	 * :param m - the number of iterations; the number size of the tridiagonalized matrix T
	 * :param reortho - boolean value for whether or not to run reorthogonalization (defaults to true)
	 * :return - a symmetric tridiagonalized matrix
	 */
	function lanczos ( A, m, reortho ) {

		// var v = [ linalg.zeros(A.cols), linalg.rand(A.cols)],
		var v = [ linalg.zeros(A.cols), new linalg.Matrix( linalg.ndarray(A.cols,0.5) )],
			T = linalg.zeros([m+1,m+1]),
			At = A.clone().T();

		// start with norm(v[1]) = 1
		v[1] = v[1].div( v[1].norm() );

		for ( var b = [0,0], w, a = [0], i = 1; i < m + 2; i++ ) {
			w = At.mul( A.mul(v[i]) ).sub( v[i-1].mul(b[i]) );
			a[i] = w.dot(v[i]);
			w = w.sub( v[i].mul(a[i]) );

			// re-orthogonalize at each iteration (if specified)
			if ( reortho || _.isUndefined(reortho) ) {
				for (var tmpa, j = 1; j < i-1; j++) {
					tmpa = w.dot(v[j]);
					w = w.sub( v[j].mul(tmpa) );
				};
			}
			
			b[i+1] = w.norm();
			v[i+1] = w.div(b[i+1]);
		}


		// construct the tridiagonal matrix T
		for (var i = 0; i < m + 1; i++) {
			T.set(i,i, a[i+1]);
			if ( i < m ) {
				T.set(i+1, i, b[i+2]);
				T.set(i, i+1, b[i+2]);
			}
		}
		return T;
	}

	/**
	 * Use QR decomposition/factorization to solve for the eigenvalues of a
	 * symmetrical tridiagonalized matrix A.
	 *
	 * see:
	 * 		- http://zoro.ee.ncku.edu.tw/na/res/10-QR_factorization.pdf
	 * 		- http://stats.stackexchange.com/questions/20643/finding-matrix-eigenvectors-using-qr-decomposition
	 *
	 * :param A - a symmetric tridiagonalized Matrix
	 */
	function eigensolveQr ( A ) {

		// extract tridiagonal component vectors 'a' (center diagonal) and 'b' (bottom diagonal)
		var a = new linalg.ndarray([A.rows,0]).map(function ( val, i ) {
			return A.get(i,i);
		});

		var b = new linalg.ndarray([A.rows-1,0]).map(function ( val, i ) {
			return A.get(i+1,i);
		});

		var i = 0;

		do {

			for ( var t = b[0], r, c = [], s = [], j = 0; j < A.cols - 1; j++ ) {
				r = Math.sqrt(a[j]*a[j]+t*t);
				c.push( a[j]/r );
				s.push( t/r );
				a[j] = r;
				t = b[j];
				b[j] = t*c[j] + a[j+1]*s[j];
				a[j+1] = -t*s[j] + a[j+1]*c[j];
				if ( j < A.cols - 2 ) {
					t = b[j+1];
					b[j+1] = t*c[j];
				}
			};

			for (var j = 0; j < A.cols - 1; j++) {
				a[j] = a[j]*c[j] + b[j]*s[j];
				b[j] = a[j+1]*s[j];
				a[j+1] = a[j+1]*c[j];	
			};

			i++;

		} while ( b[0] > EPSILON )

		return a;
	}



	/**
	 * return a function that computes the SVD by creating a tridiagonalized 
	 * matrix T (from A), and solves for it's eigenvalues
	 *
	 * :param A - a matrix of values
	 * :param n - number of Lanczos iterations and number of singular values to return
	 *		defaults to the number of columns in A if n is not provided.
	 */
	return function ( A, n ) {
		var T = lanczos( A, n - 1 || A.cols - 1 );
		return eigensolveQr( T );
	};
});