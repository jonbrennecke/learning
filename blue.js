/**
*
* BLUE is a work in progress. 
*
* BLUE - 
*
*
* PACKAGE STRUCTURE DIAGRAM
*	- graph
*	- linalg
* 	- signal
*		- compression
*		- OCR
*		- Filters
*			- High/low pass
*			- Bandpass
*		- HMM
*		- Bayesian Network
*		- PCA
*	- cluster
*
* find principal components of data
* train neural net on principal componets
* neural net sets parameters for markov model
* markov model classifies data
*
*
*
*/

// var Matrix = require( __dirname + "/linalg/linalg").Matrix,
var Classifier = require( __dirname + "/learning/neural-nets/classifier" ).Classifier;

var features = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

var classifier = new Classifier(['W','S','R','X']);


console.log(classifier.feedForward(features))

// sqrt((a[i]-b[i])^2 + (a[]))





// 	hmm = require( __dirname + "/learning/markov"),
	// pca = require( __dirname + "/learning/pca" ),
	// io = require( __dirname + "/io" );



// var txt = io.txt('./testfiles/NEF1958 F Tamoxifen SD 03_18_2014 0.5-40.txt');

// txt.read( function ( data ) {
// 	var csv = io.CSV( data, 2, 2 );

// 	console.log(csv.data.length, csv.data[0].length)

// 	// find the covariance of the first 10 samples

// 	// var samples = csv.data.slice(0,10);

// 	// pca.PrincipalComponents( samples );

// });

// var samples = new Matrix([[2.5,0.5,2.2,1.9,3.1,2.3,2,1,1.5,1.1],[2.4,0.7,2.9,2.2,3.0,2.7,1.6,1.1,1.6,0.9]]);

// pca.PrincipalComponents( samples );
// **************** //




// **************** //

// var symbols = ['R','S','W','X'],
// 	transitions = new hmm.PDF(function ( stateA, stateB ) {
// 		// given a state, return the probability of transitioning from
// 		// a state A, to another state B
// 	}),
// 	outputs = new hmm.PDF(function ( stateA, symB ) {
// 		// return the probability of outputting symbol B, while in state A
// 	}),
// 	priors = new hmm.PDF(function ( state ) {
// 		// return the probability of starting in a certain state
// 	})

// var symbols = ['walk','shop','clean'],
// 	states = ['Rainy','Sunny'],
// 	transitions = new hmm.P([
// 		['Rainy', 'Rainy', 0.7],
// 		['Rainy', 'Sunny', 0.3],
// 		['Sunny', 'Rainy', 0.4],
// 		['Sunny', 'Sunny', 0.6],
// 	]),
// 	outputs = new hmm.P([
// 		['Rainy', 'walk', 0.1],
// 		['Rainy', 'shop', 0.4],
// 		['Rainy', 'clean', 0.5],
// 		['Sunny', 'walk', 0.6],
// 		['Sunny', 'shop', 0.3],
// 		['Sunny', 'clean', 0.]
// 	]),
// 	priors = new hmm.P([
// 		['Rainy', 0.6],
// 		['Sunny', 0.4]
// 	]);

// var states = ['Healthy', 'Fever']
// 	symbols = ['normal', 'cold', 'dizzy']
// 	transitions = new hmm.P([
// 		['Healthy', 'Healthy', 0.7],
// 		['Healthy', 'Fever', 0.3],
// 		['Fever', 'Healthy', 0.4],
// 		['Fever', 'Fever', 0.6],
// 	]),
// 	outputs = new hmm.P([
// 		['Healthy', 'normal', 0.5],
// 		['Healthy', 'cold', 0.4],
// 		['Healthy', 'dizzy', 0.1],
// 		['Fever', 'normal', 0.1],
// 		['Fever', 'cold', 0.3],
// 		['Fever', 'dizzy', 0.6],
// 	]),
// 	priors = new hmm.P([
// 		['Healthy', 0.6],
// 		['Fever', 0.4]
// 	]);

// var hmm = new hmm.HiddenMarkovModel( symbols, states, transitions, outputs, priors );

// console.log(hmm.__viterbi( ['normal', 'cold', 'dizzy'] ))
