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
	 *
	 * by default, the number of hidden layers equals one; and the number of neurons in that layer is the 
	 * floor of the mean of the neurons in the input and output layers.
	 */

	function NeuralNetwork ( options ) {

		// initialize optional parameters
		var defaults = {
			rate : 0.1,
			hiddenLayers : 0,
			init : Math.random,
			activate : act.tanh,
			propogate : this.__dotProduct,
			cost : this.__dist,
			activatedValue : 1,
			deactivatedValue : -1,
			threshold : 0,
			trainer : new SelfOrganizingMap( this ),
			biasTerm : true,
			outputLayer : Layer
		}
		this.param = _.defaults( options, defaults );

		// initialize the layers
		this.layers = [ new Layer( 
			this.param.nInputs, 
			this.param.nInputs,
			this.param.init,
			this.param.activate,
			this.param.propogate )];

		// hidden layers
		// ---
		// by default, the number of hidden layers equals one; and the number of neurons in the 
		// hidden layer is the floor of the mean of the neurons in the input and output layers.
		var hiddenSize = this.param.hiddenSize || (this.param.nInputs + this.param.nOutputs)/2 | 0;

		for (var i = 0; i < this.param.hiddenLayers; i++) {
			this.layers.push( new Layer( 
				i == 0 ? this.param.nInputs : hiddenSize,
				this.param.hiddenSize ? this.param.hiddenSize : (this.param.nInputs + this.param.nOutputs)/2 | 0, 
				this.param.init,
				this.param.activate,
				this.param.propogate ));
		};

		this.layers.push( new ( this.param.outputLayer )( 
			hiddenSize || this.param.nInputs, 
			this.param.nOutputs,
			this.param.init,
			this.param.activate,
			this.param.propogate ));
	};

	NeuralNetwork.prototype = {

		/**
		 * Feed-Forward algorithm
		 * ---
		 * http://en.wikipedia.org/wiki/Feedforward_neural_network
		 */
		feedForward : function ( input ) {
			return this.layers.reduce(function ( prev, cur, i ) {

				// the result (as a vector) from the previous layer is passed to each 'neuron' node 
				// in the next layer
				return cur.broadcast( prev ); 
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
	 * :param act - activation function
	 * :param prop - propogation function
	 */
	function Layer ( w, n, init, act, prop ) {
		this.nWeights = w;
		this.nNeurons = n;
		this.init = init;
		this.activate = act;
		this.propogate = prop;

		// initialize the weights by constructing an n x w matrix of values derived from 
		// calling 'init' repeatedly
		// by default init == Math.random()
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

		/**
		 * Broadcast an input vector to all the 'neuron' nodes in a layer
		 * -- 
		 * In a basic layer, the propogation function (the dot product by default) returns
		 * a scalar value which is passed to the activation function.
		 * Other Layer classes can subclass Layer and overwrite the broadcast function
		 * 
		 * :param input - input vector
		 * :return - an array containing the output (scalar value) of each activated nueron in the layer
		 */ 
		broadcast : function ( input ) {
			return this.weights.map( function ( w ) {
				return this.activate( this.propogate( w, input ) );
			}.bind(this));
		}

	};

	/**
	 *
	 *
	 *
	 */
	function SelfOrganizingMap ( network ) {
		this.network = network;0
	};


	SelfOrganizingMap.prototype = {

	};


	/**
	 * a Probabalistic Neural Network for classifying
	 * 
	 * inherits from the NeuralNetwork base class
	 */
	function Classifier ( classes, options ) {

		this.classes = classes;

		var defaults = {
			nInputs : classes.length,
			nOutputs : 1,
			hiddenLayers : 1,
			hiddenSize : classes.length,
			outputLayer : ClassifierOutputLayer
		};

		NeuralNetwork.call( this, _.defaults( options, defaults ) );
	};
	Classifier.prototype = Object.create( NeuralNetwork.prototype );

	/**
	 * Classify a given input vector using softmax to determine the
	 * class with the highest probability
	 *
	 */
	Classifier.prototype.classify = function ( input ) {
		var p = this.feedForward( input )

		return this.classes[ p.reduce(function ( prev, cur, i ) {
			if ( p[prev] < p[i] ) return i
			else return prev
		},0) ];
	};

	/** 
	 * Output layer for Classifier neural networks
	 *
	 * inherits from Layer 
	 *
	 */
	function ClassifierOutputLayer ( w, n, init, act, prop ) {
		Layer.call( this, w, n, init, act, prop );
	};
	ClassifierOutputLayer.prototype = Object.create( Layer.prototype );

	/**
	 * replace Layer's broadcast function with softmax, to calculate the probability of each
	 * of the given classes
	 */
	ClassifierOutputLayer.prototype.broadcast = function ( input ) {
		return this.softmax( input );
	}

	/**
	 *
	 * Softmax function
	 * ---
	 * converts a length-K vector of arbitrary real values to a 
	 * length-K vector of probabilities in the range (0, 1).
	 *
	 * http://en.wikipedia.org/wiki/Softmax_function
	 */
	ClassifierOutputLayer.prototype.softmax = function ( vec ) {
		var sum = vec.reduce(function ( prev, cur ) {
			return prev + Math.exp(cur);
		},0);

		return vec.map( function ( val, i ) {
			return Math.exp( val ) / sum;
		});
	};


	return {
		NeuralNetwork : NeuralNetwork,
		Classifier : Classifier,
		Layer : Layer,
		SelfOrganizingMap : SelfOrganizingMap,
		act : act
	}
});