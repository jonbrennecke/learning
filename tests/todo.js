/**
 * ~~~~~~~~~~~ TODO ~~~~~~~~~~~
 *
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
		for (var i = 1; i < m - 1; i++) {
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

/**
 * ~~~~~~~~~~~ TODO ~~~~~~~~~~~
 *
 * Multiple Relatively Robust Representations Algorithm
 * --
 * http://web.eecs.utk.edu/~dongarra/etemplates/node93.html
 *
 */
function mrrr ( M ) {}