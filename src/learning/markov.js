
var linalg = require( __dirname + "/../linalg/linalg" );

// polyfill for Harmony's Math.log10
(Math.log10 = function (x) {
  return - Math.log(x) / Math.LN10;
})();


/**
 *
 * Probability distribution function for Continuous Hidden Markov Models
 *
 * TODO
 *
 * :param callback - function to return the probability 
 */
function PDF ( callback ) {
	this.callback = callback;
};

PDF.prototype = {
	
	prob : function ( a, b ) {
		this.callback( a, b )
	},

	logprob : function ( a, b ) {
		return - Math.log10( this.prob(a,b) )
	}
};

/**
 *
 * Conitional probability for a Discrete Hidden Markov Models
 *
 * :param a - array of key-value probabilities
 *
 */
function P ( a ) {
	this.values = a;
	this.keys = a.map(function ( val ){ return val[0] });
};

P.prototype = {

	find : function ( a, b ) {
		var index = 0;
		this.keys.some( function ( c, i ) {
			if ( a == c ) {
				if ( !b || this.values[i][1] != b ){}
				else { 
					index = i; 
					return true; 
				}
			}
		}.bind(this));
		return index
	},

	prob : function ( a, b ) {
		if ( b )
			return this.values[this.find(a,b)][2];
		return this.values[this.find(a)][1]
	},

	logprob : function ( a, b ) {
		return Math.log10( this.prob(a,b) )
	}
};


/**
 *
 * Viterbi Algorithm for decoding the most likely sequene of (hidden) events from a
 * sequence of states
 * --
 * eg. viterbi is used by the class HiddenMarkovModel for matching symbols 
 * with an unlabeled sequence of observed states
 *
 * see
 *	- http://en.wikipedia.org/wiki/Viterbi_algorithm
 *	- http://www.nltk.org/_modules/nltk/tag/hmm.html
 *
 *
 * :param unlabeled - the unlabeled sequence to decode
 * :param symbols - the set of output symbols (alphabet)
 * :param states - a set of states representing state space
 * :param transitions: transition probabilities; P(state i | state j) is the
 *       probability of transition from state i given the model is in
 *       state j
 * :param outputs: output probabilities; P(output k | state i) is the probability
 *       of emitting symbol k when entering state i
 * :param priors: initial state distribution; P(state i) is the probability
 *       of starting in state i
 *
 */
function viterbi ( unlabeled, symbols, states, transitions, outputs, priors ) {
	
	var V = linalg.ndarray([ unlabeled.length, states.length ]),
		B = linalg.ndarray([ unlabeled.length ],{});

	// find the starting log probabilities for each state
	states.forEach( function ( state, i ) {
		V[0][i] = priors.logprob(state) + outputs.logprob(state,unlabeled[0]);
	});

	// find the maximum log probabilities for reaching each state at time t
	unlabeled.slice(1).forEach( function ( symbol, t ) {
		states.forEach( function ( sj, j ) {
			var best;
			states.forEach( function ( si, i ) {
				var val = V[t][i] + transitions.logprob(si,sj)
				if ( !best || val > best[0] )
                    best = [val, si];
			});
			V[t+1][j] = best[0] + outputs.logprob(sj, symbol);
            B[t+1][sj] = best[1];
		});
	});

	// find the highest probability final state
	var best, val;
	states.forEach( function ( state, i ) {
		val = V[ unlabeled.length - 1][i];
		if ( !best || val > best[0] )
			best = [ val, state ]
	});

	// traverse the back-pointers B to find the state sequence
    var current = best[1],
        sequence = [current];

    for (var t = unlabeled.length - 1; t > 0; t--) {
		var last = B[t][current];
		sequence.push(last);
		current = last;
    };

    return sequence.reverse();
};


function continuousViterbi ( unlabeled, symbols, transitions, outputs, priors ) {
	// TODO
};


/**
 *
 * see http://www.nltk.org/_modules/nltk/tag/hmm.html
 *
 * :param symbols - the set of output symbols (alphabet)
 * :param states - a set of states representing state space
 * :param transitions: transition probabilities; Pr(state i | state j) is the
 *       probability of transition from state i given the model is in
 *       state j
 * :param outputs: output probabilities; Pr(output k | state i) is the probability
 *       of emitting symbol k when entering state i
 * :param priors: initial state distribution; Pr(state i) is the probability
 *       of starting in state i
 */

function HiddenMarkovModel ( symbols, states, transitions, outputs, priors ) {
	this.__symbols = symbols; 
	this.__states = states;
	this.__transitions = transitions; 
	this.__outputs = outputs;
	this.__priors = priors;
};

HiddenMarkovModel.prototype = {
	train : function ( labeled, unlabeled ) {

	},

	__viterbi : function ( unlabeled ) {
		return viterbi( unlabeled, this.__symbols, this.__states, this.__transitions, this.__outputs, this.__priors )
	}
};

// function ContinuousHiddenMarkovModel ( symbols, transitions, outputs, priors ) {
// 	this.__symbols = symbols; 
// 	this.__transitions = transitions; 
// 	this.__outputs = outputs;
// 	this.__priors = priors;
// }

module.exports = {
	HiddenMarkovModel : HiddenMarkovModel,
	P : P
};



