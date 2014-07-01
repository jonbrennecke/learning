var Classifier = require( __dirname + "/../learning/neural-nets/classifier" ).Classifier;

var features = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

var classifier = new Classifier(['W','S','R','X']);


console.log(classifier.input(features))
