var svd = require( __dirname + "/../learning/svd"),
	linalg = require( __dirname + "/../linalg/linalg"),
	nets = require( __dirname + "/../learning/neural-nets/nets"),
	edflib = require( __dirname + "/../io/edflib" ),
	edf = new edflib.Reader( __dirname + '/testfiles/BA1216 05_07_2012.edf' );


var chan = 2;
edf.getChannel(chan).then( function ( info ) {
	
	var fs = +info.header.physMax[chan];
	



});



// var txt = io.txt( __dirname + '/testfiles/NEF2027 Baseline 05_20_2014 0.5-20 JB.txt');

// txt.read( function ( data ) {
// 	var csv = io.CSV( data, 2, 2 );

// 	// the first 10 samples
// 	var samples = csv.data.slice(0,10);

// 	// convert the file text data into numbers
// 	samples = samples.map( function ( row ) {
// 		return row.map( Number );
// 	});

// 	// perform singular value decomposition
// 	var singularValues = svd( new linalg.Matrix(samples), 20 );

// 	// create a neural network classifier
// 	var classifier = new nets.Classifier(["S","R","W","X"], {
// 		nInputs : 20,
// 	});


// 	var state = classifier.classify( singularValues );
// 	console.log(state)


// });