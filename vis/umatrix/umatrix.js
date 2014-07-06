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

	/**
	 *
	 * Unified Distance Matrix
	 *
	 */
	function UMatrixController () {

	};

	UMatrix.prototype = {

	};

});