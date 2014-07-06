var linalg = require( __dirname + "/../linalg/linalg" ),
	_ = require("underscore");


function PrincipalComponents ( samples ) {
	if (!(this instanceof PrincipalComponents)) {
		return new PrincipalComponents( samples );
	}

	// convert an array to a matrix
	if ( _.isArray(samples) )
		samples = linalg.Matrix(samples);

	bidiag(samples)

	// subtract the mean of each sample

	// calculate SVD
	// var precision

};

PrincipalComponents.prototype = {

};

function covariance ( a, b ) {

}

function bidiag ( A ) {
	
};


/**
 * implementation of the HouseHolder method
 *
 * The HouseHolder Method allows us to change a symmetric n×n matrix A = (aij) 
 * into a tridiagonal matrix with the same set of eigenvalues.
 *
 * see http://www.mcs.csueastbay.edu/~malek/Class/Housholder.pdf
 *
 */
function HouseHolder ( A ) {
	// B = A, k = 1
	// Math.sqrt()

	for (var i = 0; i < A.shape[0]; i++) {
		A[i]
	};

	// A.map( function ( el, i ) {
	// 	console.log(el,i)
	// })

	// s = sqrt(sum(b(i,k)^2))
};


/**
 *
 * create a 2D Covariance Matrix from 'vector'
 *
 * where each element [i,j] is the covariance between the i-th and j-th 
 * dimension of 
 *
 */
function CovarianceMatrix ( vector ) {

	// linalg.matrix.call(this);
};


// CovarianceMatrix.prototype = Object.create( linalg.matrix.prototype )



module.exports = {
	PrincipalComponents : PrincipalComponents,
	CovarianceMatrix : CovarianceMatrix
}