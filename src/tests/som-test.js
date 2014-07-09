var nets = require( __dirname + "/../learning/neural-nets/nets");


var network = new nets.NeuralNetwork({
	nInputs : 1,
	nOutputs : 1,
	hiddenLayers : 1,
	hiddenSize : 5
});


// train on the sin function
function y ( x ) { return Math.sin(x); }

var max = 100, min = 0;



// for (var i = 0; i < 1000; i++) {
	var x = Math.random() * ( max - min ) + min;
// 
	// console.log(network.feedForward([x]))
	// console.log(network)
	network.train( [x], [y(x)] ); 
	// console.log(network)

	// console.log(network.feedForward([x]))
// }