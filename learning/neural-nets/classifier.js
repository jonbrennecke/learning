var nn = require( __dirname + "/network" );


/**
 *
 * a Probabalistic Neural Network for classifying
 * 
 * inherits from the NeuralNetwork base class
 *
 */
function Classifier ( classes ) {

	var param = {
		nInputs : classes.length - 1,
		nOutputs : 1,
		hiddenLayers : 1,
		activate : nn.act.tanh
	};

	nn.NeuralNetwork.call( this, param )
};
Classifier.prototype = Object.create(nn.NeuralNetwork.prototype);

Classifier.prototype.input = function ( input ) {
	return this.feedForward(input)
};


function ClassifierPatternLayer () {

};
ClassifierPatternLayer.prototype = {

};

function ClassifierOutputLayer ( classes ) {
	// nn.Layer.call( this, param )
};

ClassifierOutputLayer.prototype = {

};



module.exports = {
	Classifier : Classifier
}
