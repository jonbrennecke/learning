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
	 * default propogation function
	 * returns the dot product of the vectors 'w' and 'i'
	 *	 
	 * :param w - weight value
	 * :param i - input value
	 */
	dotProduct = function ( a, b ) {
		return a.reduce(function ( p, c, i ) {
			return p + c * b[i]
		},0);
	}


	/**
	 *
	 * a set of commonly used activation functions (dxdy) and their first derivatives (dydx)
	 * 
	 * Functions:
	 * 		- sigmoid, see http://en.wikipedia.org/wiki/Sigmoid_function
	 *		- softplus, see http://en.wikipedia.org/wiki/Rectifier_(neural_networks)
	 *		- hyperbolic tangent, see http://en.wikipedia.org/wiki/Hyperbolic_tangent
	 */
	var act = {
		sigmoid : {
			dxdy : function ( x ) {
				return 1 / ( 1 + Math.exp(-x) );
			},
			dydx : function ( y ) {
				return y * (1 - y);
			},
		},

		softplus : {
			dxdy : function ( x ) {
				return Math.log10( 1 + Math.exp(x) );
			},
			dydx : function ( y ) {
				return 1 / (1 + Math.exp(-y));
			},
		},

		tanh : {
			dxdy : function ( x ) {
				return ( 1 - Math.exp( -2 * x ) ) / ( 1 + Math.exp( -2 * x ) );
			},			
			// d(tanh)/dy = sech^2(y)
			dydx : function ( y ) {
				return Math.pow( (2 * Math.exp(-y)) / ( 1 + Math.exp(-2 * y)), 2);
			}
		}
	}

	/**
	 *
	 * Neural Network Controller
	 * ---
	 * by default, the NeuralNetwork class creates a multilayer feed-forward back-propogating network
	 *
	 *
	 * see 	- http://en.wikipedia.org/wiki/Neural_network
	 * 		- http://en.wikipedia.org/wiki/Deep_learning#Deep_neural_networks
	 *		- http://stats.stackexchange.com/questions/181/how-to-choose-the-number-of-hidden-layers-and-nodes-in-a-feedforward-neural-netw
	 *		- http://www.faqs.org/faqs/ai-faq/neural-nets/part1/preamble.html
	 *
	 * ---
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
	 * NOTE: by default, the number of hidden layers equals one; and the number of neurons in that layer is the 
	 * floor of the mean of the neurons in the input and output layers.
	 */

	function NeuralNetwork ( options ) {

		// initialize optional parameters
		var defaults = {
			rate : 0.1,
			hiddenLayers : 1,
			init : Math.random,
			activate : act.tanh,
			propogate : dotProduct,
			activatedValue : 1,
			deactivatedValue : -1,
			threshold : 0,
			trainer : Trainer,
			biasTerm : true,
			outputLayer : Layer
		}
		this.param = _.defaults( options, defaults );

		// insantiate the trainer
		this.trainer = new ( this.param.trainer )({ 
			network : this, 
			cost : this.param.cost,
			rate : this.param.rate,
			activate : this.param.activate, 
		});

		// initialize the layers
		this.layers = [ new Layer({ 
			nWeights : this.param.nInputs, 
			nNeurons : this.param.nInputs,
			init : this.param.init,
			activate : this.param.activate.dxdy,
			propogate : this.param.propogate,
			number : 0 
		})];

		// hidden layers
		// ---
		// by default, the number of hidden layers equals one; and the number of neurons in the 
		// hidden layer is the floor of the mean of the neurons in the input and output layers.
		var hiddenSize = this.param.hiddenSize || (this.param.nInputs + this.param.nOutputs)/2 | 0;

		for (var i = 0; i < this.param.hiddenLayers; i++) {
			this.layers.push( new Layer({ 
				nWeights : i == 0 ? this.param.nInputs : hiddenSize,
				nNeurons : this.param.hiddenSize ? this.param.hiddenSize : (this.param.nInputs + this.param.nOutputs)/2 | 0, 
				init : this.param.init,
				activate : this.param.activate.dxdy,
				propogate : this.param.propogate,
				number : i + 1 
			}));
		};

		this.layers.push( new ( this.param.outputLayer )({ 
			nWeights : hiddenSize || this.param.nInputs, 
			nNeurons : this.param.nOutputs,
			init : this.param.init,
			activate : this.param.activate.dxdy,
			propogate : this.param.propogate,
			number : this.param.hiddenLayers + 1 }));
	};

	NeuralNetwork.prototype = {

		/**
		 * Feed-Forward algorithm
		 * ---
		 * http://en.wikipedia.org/wiki/Feedforward_neural_network
		 */
		feedForward : function ( input, training ) {
			return this.layers.reduce(function ( prev, cur, i ) {

				// the result (as a vector) from the previous layer is passed to each 'neuron' node 
				// in the next layer
				return cur.broadcast( prev, true ); 
			}, input );
		},

		/**
		 *
		 * call the training method of the trainer object
		 *
		 */
		train : function ( input, expect ) {
			return this.trainer.train(input,expect);
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
	function Layer ( param ) {
		_.extend(this, _.pick( param, ["nWeights","nNeurons","init","activate","propogate","number"]));

		this.output = new Array( param.nNeurons );

		// initialize the weights by constructing an n x w matrix of values derived from 
		// calling 'init' repeatedly
		// by default init == Math.random()
		this.weights = (function ( a, i ) { 
			while (i--) {
				a[i] = [];
				(function ( b, j ) { 
					while (j--)
						b[j] = param.init(j);
				})(a[i],param.nWeights);
			}
			return a
		})([],param.nNeurons);
	}; 

	Layer.prototype = {

		/**
		 * Broadcast an input vector to all the 'neuron' nodes in a layer
		 * -- 
		 * In a basic layer, the propogation function (the dot product by default) returns
		 * a scalar value which is passed to the activation function.
		 * Other Layer classes can subclass Layer and overwrite the broadcast function
		 * ---
		 * :param input - input vector
		 * :param training - boolean value, whether or not the network is currently being trained
		 * :return - an array containing the output (scalar value) of each activated nueron in the layer
		 */ 
		broadcast : function ( input, training ) {
			// if training is active, save the input array
			if ( training ) 
				this.input = input;

			return this.weights.map( function ( w, i ) {
				var output = this.activate( this.propogate( w, input ) );
				
				// if training is active, save the output values
				if ( training )
					this.output[i] = output;
				
				return output;
			}.bind(this));
		}

	};

	/**
	 * Neural Network Trainer
	 * ---
	 * see
	 *		- http://en.wikipedia.org/wiki/Backpropagation
	 */
	function Trainer ( param ) {
		this.network = param.network;
		this.cost = param.cost || this.dist;
		this.rate = param.rate;
		this.activate = param.activate;
	};


	Trainer.prototype = {

		/**
		 * Gradient Descent
		 * ---
		 * compute the gradient descent vector for each weight in the neuron's weight vector 
		 * ---
		 * :param weights - an array representing a neuron's weight vector
		 * :param input - input to the layer
		 * :param expect - expected output of the layer
		 * :param hidden - boolean value designating whether the layer is the output layer
		 *		
		 * :return - the weight vector modified by the deltas for each weight
		 */
		gradDescent : function ( weights, input, expected, hidden ) {
			return weights.map( function ( w, i ) {
				this.rate * (input[i] - expected[i]) * this.act.dydx(input[i]) * w
			});
		},

		/**
		 * Train the network by 'back propogation'
		 * ---
		 * see
		 *		- http://en.wikipedia.org/wiki/Backpropagation
		 * ---
		 * :param expected - expected result of 'feedForward'
		 *
		 */
		backPropogate : function ( expected ) {

			// the output layer
			var out = this.network.layers[ this.network.layers.length - 1 ],
				act = this.activate,
				rate = this.rate;

			// the output layer is processed differently since the output layer
			// can be directly compared to the expected answer,
			var deltas = out.weights.map( function ( neuron, i ) {
				return neuron.map( function ( w, j ) {
					var delta = rate * (out.output[i] - expected) * act.dydx(out.output[i]) * out.input[j];
					out.weights[i][j] -= delta; 
					return delta;
				});
			});

			// loop backwards through the other layers
			for (var layer, sum, i = this.network.layers.length - 2; i >= 0; i--) {

				layer = this.network.layers[i], next = this.network.layers[i+1];

				// compute the deltas of the 
				deltas = layer.weights.map( function ( neuron, k ) {

					console.log(k)

					// dot product of the deltas and the weights of the succeeding layer
					sum = dotProduct( next.weights[k], deltas[k] );

					return neuron.map( function ( w, j ) {
						var delta = rate * sum * act.dydx(layer.output[k]) * layer.input[j];
						layer.weights[k][j] -= delta;
						return delta;
					});
				});
			}
		},

		/**
		 * training by back propogation and gradient descent
		 * ---
		 * :param input - input vector
		 * :param expect - expected answer
		 */
		train : function ( input, expected ) {
			// feed forward with the second param 'training', set to true
			// to save the input values
			var predict = this.network.feedForward( input, true );
			this.backPropogate( input, expected )
		},

		/**
		 * the default 'cost' function is the n-dimensional Euclidean distance between neurons
		 *
		 * :param a - first weight vector
		 * :param b - second weight vector
		 *
		 */
		dist : function ( a, b ) {
			return Math.sqrt(a.reduce(function ( prev, cur, i ) {
				return prev + Math.pow(cur - b[i], 2);
			},0));
		}

	};



	/**
	 * a Probabalistic Neural Network for classification purposes
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
	 * Output layer for Classifier networks
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
		Trainer : Trainer,
		act : act
	}
});