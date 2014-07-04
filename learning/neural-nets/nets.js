/** 
 * Copyright 2014 Jon Brennecke
 * Released under the MIT license.
 *
 *
 *
 * Machine learning algorithms for artificial neural networks
 *
 */

(function ( mod ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) // CommonJS, Node
		module.exports = mod(require('underscore'),require( "q" ));
	else if (typeof define == "function" && define.amd) // AMD
		return define(["underscore","q"], mod);
	else // normal browser env
		this.nets = mod( _, Q )();

})(function ( _, Q ) {



	// polyfill for Harmony's Math.log10
	(Math.log10 = function (x) {
	  return - Math.log(x) / Math.LN10;
	})();


	/**
	 *
	 * a set of commonly used activation functions
	 *
	 */
	var act = {

		// see http://en.wikipedia.org/wiki/Sigmoid_function
		sigmoid : function ( x ) {
			return 1 / ( 1 + Math.exp(-x) );
		},

		// see http://en.wikipedia.org/wiki/Rectifier_(neural_networks)
		softplus : function ( x ) {
			return Math.log10( 1 + Math.exp(x) );
		},

		// see http://en.wikipedia.org/wiki/Hyperbolic_tangent
		tanh : function ( x ) {
			return ( 1 - Math.exp( -2 * x ) ) / ( 1 + Math.exp( -2 * x ) );
		}
	}

	/**
	 *
	 * Neural Network
	 * ---
	 *
	 * see 	- http://en.wikipedia.org/wiki/Neural_network
	 * 		- http://en.wikipedia.org/wiki/Deep_learning#Deep_neural_networks
	 *		- http://stats.stackexchange.com/questions/181/how-to-choose-the-number-of-hidden-layers-and-nodes-in-a-feedforward-neural-netw
	 *		- http://www.faqs.org/faqs/ai-faq/neural-nets/part1/preamble.html
	 *
	 * :param options - object with the following fields:
	 * 		:field inputs - the dimension of the input layer
	 * 		:field outputs - the dimension of the output layer
	 * 		:field hidden - (optional) the number of hidden layers in the network
	 *			eg. setting n=0 (or left blank) will create a 'shallow' NN with only input and output
	 *			layers, but n > 0 will create a 'deep' NN with n hidden layers for additional abstraction
	 *			between the input and output layers
	 *		:field init - (optional) scalar value or callback function to initialize the weight vectors.
	 *			If 'init' is a function, it is called once per element of the neuron's weight vector.
	 *			If 'init' is a Number, it will be assigned to all the weights
	 * 		:field rate - (optional) the learning rate; defaults to 0.1
	 * 		:field cost - (optional) cost function
	 * 		:field activation - (optional) activation function (defaults to )

	 *
	 * by default, the number of hidden layers equals one; and the number of neurons in that layer is the 
	 * floor of the mean of the neurons in the input and output layers.
	 *
	 *
	 */

	function NeuralNetwork ( options ) {

		// initialize optional parameters
		var defaults = {
			rate : 0.1,
			hiddenLayers : 0,
			init : this.__random,
			activate : act.sigmoid,
			propogate : this.__dotProduct,
			cost : this.__dist,
			activatedValue : 1,
			deactivatedValue : -1,
			threshold : 0,
			// biasTerm : false TODO
		}
		this.param = _.defaults( options, defaults );

		// initialize the layers
		this.layers = [ new Layer( 
			this.param.nInputs, 
			this.param.nInputs,
			this.param.init )];

		// hidden layers
		// ---
		// by default, the number of hidden layers equals one; and the number of neurons in the 
		// hidden layer is the floor of the mean of the neurons in the input and output layers.
		var hiddenSize = this.param.hiddenSize || (this.param.nInputs + this.param.nOutputs)/2 | 0;

		for (var i = 0; i < this.param.hiddenLayers; i++) {
			this.layers.push( new Layer( 
				i == 0 ? this.param.nInputs : hiddenSize,
				this.param.hiddenSize ? this.param.hiddenSize : (this.param.nInputs + this.param.nOutputs)/2 | 0, 
				this.param.init ));
		};

		this.layers.push( new Layer( 
			hiddenSize || this.param.nInputs, 
			this.param.nOutputs,
			this.param.init ));

	};

	NeuralNetwork.prototype = {

		/**
		 *
		 * Feed-Forward algorithm
		 *
		 */
		feedForward : function ( input ) {
			var param = this.param;
			return this.layers.reduce(function ( prev, cur, i ) {

				// activated/deactivated values are 1 and -1 (by default, or param.activatedValue 
				// and param.deactivatedValue) so we can use an array of 8bit signed ints to slightly 
				// speed things up here
				var a = new Int8Array(cur.weights.length)
				cur.weights.map(function ( w, j ) {
					var b = param.activate( param.propogate( w, prev ) );
					a[j] = b > param.threshold ? param.activatedValue : param.deactivatedValue;
				});

				return a

			}, input );
		},

		backPropogate : function ( ) {

		},

		gradDescent : function () {

		},

		/**
		 *
		 * default propogation function
		 * returns the dot product of the vectors 'w' and 'i'
		 *	 
		 * :param w - weight value
		 * :param i - input value
		 */
		__dotProduct : function ( w, i ) {
			return w.reduce(function ( p, c, j ) {
				return p + c * i[j]
			},0);
		},

		/**
		 * randomize the weights
		 * default initialization function
		 *
		 */
		__random : function () {
			return Math.random();
		},

		/**
		 * the default 'cost' function is the n-dimensional Euclidean distance between neurons
		 *
		 * :param a - first weight vector
		 * :param b - second weight vector
		 *
		 */
		__dist : function ( a, b ) {
			return Math.sqrt(a.reduce(function ( prev, cur, i ) {
				return prev + Math.pow(cur - b[i], 2);
			},0));
		}

	};


	/**
	 *
	 * A layer of n 'neurons'
	 *
	 * :param w - length of the layer; eg. dimension of the weight vector of each of n 'neurons'
	 * :param n - dimension of the layer; eg. number of 'neurons'
	 * :param init - scalar value or callback function to initialize the weight vectors.
	 *		If 'initial' is a function, it is called once per element of the neuron's weight vector.
	 *		If 'initial' is a Number, it will be assigned to all the weights
	 */
	function Layer ( w, n, init ) {
		this.nWeights = w;
		this.nNeurons = n;
		this.init = init;

		// initialize the weights by constructing an d x l matrix of values derived from 
		// calling 'init' repeatedly
		this.weights = (function ( a, i ) { 
			while (i--) {
				a[i] = [];
				(function ( b, j ) { 
					while (j--)
						b[j] = init(j);
				})(a[i],w);
			}
			return a
		})([],n);
	}; 

	Layer.prototype = {

	};


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
			activate : act.tanh
		};

		NeuralNetwork.call( this, param )
	};
	Classifier.prototype = Object.create( NeuralNetwork.prototype );

	/**
	 * 
	 *
	 */
	Classifier.prototype.input = function ( input ) {
		return this.feedForward(input)
	};

	// function ClassifierPatternLayer () {

	// };
	// ClassifierPatternLayer.prototype = {

	// };

	// function ClassifierOutputLayer ( classes ) {
	// 	// nn.Layer.call( this, param )
	// };

	// ClassifierOutputLayer.prototype = {

	// };




	return {
		NeuralNetwork : NeuralNetwork,
		Classifier : Classifier,
		Layer : Layer,
		act : act
	}
});