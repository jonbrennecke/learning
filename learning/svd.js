
var linalg = require( __dirname + "/../linalg/linalg"),
	_ = require('underscore');

/**
 *
 * compute the SVD (Singular Value Decomposition) of a matrix A
 *
 * see http://arxiv.org/abs/1007.5510
 *
 */
function svd ( A ) {

	console.log(lanczos( A, 1 ).toArray().join(',\n'))

	// var m = 4;

 // 	// tmp
	// var a = linalg.ndarray([1,m],1)[0]
	// var b = linalg.ndarray([1,m],2)[0];

	// b[0] = 0;

	// bisectTridiagonal( a, b, m );

};


/**
 *
 * reduces a matrix A to hessenberg form by a series of Householder reflections
 *
 */


/**
 * Lanczos Algorithm
 * ---
 * finds the eigenvectors/values of a square matrix 'A', or the Singular Value Decomposition (SVD) of 
 * a rectangular matrix 'A'
 *
 * see 
 *		- http://en.wikipedia.org/wiki/Lanczos_iteration
 *		- http://en.wikipedia.org/wiki/Singular_value_decomposition
 *		- http://bickson.blogspot.com/2011/10/lanczos-algorithm-for-svd-singule-value.html
 *
 * :param A - a square or rectangular matrix
 * :param m - the number of iterations; the number size of the tridiagonalized matrix T
 * :param reortho - boolean value for whether or not to run reorthogonalization (defaults to true)
 */
function lanczos ( A, m, reortho ) {

	var v = [ linalg.zeros(A.cols), linalg.rand(A.cols)],
		b = [0,0], w, a = [0],
		T = linalg.zeros([m,m]),
		At = A.clone().T();

	// start with norm(v[1]) = 1
	v[1] = v[1].div( v[1].norm() );

	for (var i = 1; i < m + 1; i++) {
		w = At.mul( A.mul(v[i]) ).sub( v[i-1].mul(b[i]) );
		a.push( w.dot( v[i]) );
		w = w.sub( v[i].mul(a[i]) );

		// re-orthogonalize at each iteration (if specified)
		if ( reortho || _.isUndefined(reortho) ) {
			for (var j = 1; j < i-1; j++) {
				tmpa = w.dot(v[j]);
				w = w.sub( v[j].mul(tmpa) );
			};
		}
		
		b.push( w.norm() );
		v.push( w.div(b[i+1]) );	
	}

	// construct the tridiagonal matrix T
	for (var i = 0; i < m; i++) {
		T.set(i,i, a[i+1]);
		if ( i < m - 1 ) {
			T.set(i+1, i, b[i+2]);
			T.set(i, i+1, b[i+2]);
		}
	}

	return T;
}


/**
 *
 * Multiple Relatively Robust Representations Algorithm
 * --
 * http://web.eecs.utk.edu/~dongarra/etemplates/node93.html
 *
 */
function mrrr ( M ) {

}

// http://zoro.ee.ncku.edu.tw/na/res/10-QR_factorization.pdf
// http://stats.stackexchange.com/questions/20643/finding-matrix-eigenvectors-using-qr-decomposition
function qr ( A ) {

}

function qrFactorize ( A ) {
	// [[3,2,0],[2,-5,-1],[0,-1,4]]
	
}


function eigensolveQr ( A, n ) {



	for (var i = 0; i < n; i++) {
		
	};
}


/**
 * Find the eigenvalues of a tridiagonalized matrix by bisection
 * --
 * see:
 * 		- https://people.fh-landshut.de/~maurer/numeth/node91.html#GBNDMIN
 * 		- http://www.enggjournals.com/ijcse/doc/IJCSE11-03-12-060.pdf
 *		- http://www.maths.ed.ac.uk/~aar/papers/bamawi.pdf
 *
 */
function bisectTridiagonal ( a, b, m ) {

	console.log(a)
	console.log(b)

	// estimate initial upper and lower limits of the eigenspetrum by Gersgorin bounds
	var umin = a.reduce(function ( prev, cur, i ) {
		var tmp = a[i]-Math.abs(b[i])-Math.abs( b[i+1] || 0);
		return i ? Math.min(tmp,prev) : tmp
	},0);

	var umax = a.reduce(function ( prev, cur, i ) {
		var tmp = a[i]+Math.abs(b[i])+Math.abs( b[i+1] || 0);
		return i ? Math.max(tmp,prev) : tmp
	},0);

	var numEig = 1;

	// numerical tolerance 10e-7

	do {
		var epsilon = 1e-7 * Math.max( Math.abs(umin), Math.abs(umax) ),
			s = ( umin + umax ) * 0.5, 
			d = a[0] - s, 
			lneg = 0;

		// triangular decomposition
		for (var i = 1; i < m; i++) {
			lneg += d < 0 ? 1 : 0;
			// lneg += (( b[i] / ( d || epsilon )) < 0) ? 1 : 0;
			d = a[i] - s - (b[i]*b[i])/( d || epsilon );
		}

		console.log(umin,s,umax,lneg)

		// set the new bounds
		if ( lneg < numEig ) umin = s;
		else umax = s;

	} while ( Math.abs( umax - umin ) > epsilon )

	// return s
}

module.exports = {
	svd : svd
}
