var svd = require( __dirname + "/../learning/svd"),
	linalg = require( __dirname + "/../linalg/linalg"),
	io = require( __dirname + "/../io/io" ),
	nets = require( __dirname + "/../learning/neural-nets/nets");


var txt = io.txt( __dirname + '/testfiles/NEF2027 Baseline 05_20_2014 0.5-20 JB.txt');

txt.read( function ( data ) {
	var csv = io.CSV( data, 2, 2 );

	// the first 10 samples
	var samples = csv.data.slice(0,10);

	// convert the file text data into numbers
	samples = samples.map( function ( row ) {
		return row.map( Number );
	});

	// perform singular value decomposition
	var singularValues = svd( new linalg.Matrix(samples), 20 );

	// create a neural network classifier
	var classifier = new nets.Classifier(["S","R","W","X"], {
		nInputs : 20,
	});


	var state = classifier.classify( singularValues );
	console.log(state)


});