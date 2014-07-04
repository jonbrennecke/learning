var svd = require( __dirname + "/../learning/svd"),
	linalg = require( __dirname + "/../linalg/linalg"),
	io = require( __dirname + "/../io" ),
	nets = require( __dirname + "/../learning/neural-nets/nets"),
	trainers = require( __dirname + "/../learning/neural-nets/trainers");


var txt = io.txt( 'testfiles/NEF1990 Baseline 05_20_2014 0.5-20 JB.txt');

txt.read( function ( data ) {
	var csv = io.CSV( data, 2, 2 );

	// the first 10 samples
	var samples = csv.data.slice(0,10);

	// convert the file text data into numbers
	samples = samples.map( function ( row ) {
		return row.map( Number );
	});

	// perform singular value decomposition
	var singularValues = svd( new linalg.Matrix(samples) );

	// create a neural net
	var classifier = new nets.Classifier(["S","R","W","X"]);

	console.log(classifier)


	// trainers.SelfOrganizingMap()


});