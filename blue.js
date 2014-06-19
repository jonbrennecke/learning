/**
*
* UML DIAGRAM
*	- linalg
* 	- signal
*		- OCR
*		- Filters
*			- High/low pass
*			- Bandpass
*		- HMM
*		- Bayesian Network
*		- PCA
*	- cluster
*
*
*/


var matrix = require( __dirname + "/lib/linalg" ).matrix


var m = new matrix([[1,2,3],[3,4,5]],'int8');

// m.T()

// console.log(m.toString())

m.$map(function ( val, i, vec ) {
	console.log(val,i)
})