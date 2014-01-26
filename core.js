/** 
 * Copyright 2014 Jon Brennecke
 * rjseleased under the MIT license.
 *
 */

var rjs = rjs || {};

rjs.Vector3D = function(x,y,z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

rjs.Vector3D.prototype = {

	// set the coordinates of this vector 
	set : function(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	},

	// find the vector projection in the direction of v 
	proj : function(v){ return new rjs.Vector3D(v.x - this.x, v.y - this.y, v.z - this.z) }, // TODO rename!!!
    
    // find the norm of this vector
    norm : function(){ return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z) },
	
	// return (a copy of) this vector as a unit vector
	normalize : function(){
	    var n = this.norm();
		return new rjs.Vector3D( this.x / n, this.y / n, this.z / n )
	},

	// subtract a vector 'v' from the vector 
	sub : function(v){
		return new rjs.Vector3D(this.x - v.x, this.y - v.y, this.z - v.z);
	},

	// add a vector 'v' to the vector
	add : function(v){
		return new rjs.Vector3D(this.x + v.x, this.y + v.y, this.z + v.z);
	},

	// multiply components of the vector by a scalar 's'
	multiply : function(s){
		return new rjs.Vector3D(this.x * s, this.y * s, this.z * s);
	},

	// return the dot product of this vector
	dot : function(v){
		return v.x * this.x + v.y * this.y + v.z * this.z;
	},
	
	// return the cross product of this vector
	cross : function(v){
	    return new rjs.Vector3D (
		    this.y * v.z - this.z * v.y,
		    this.z * v.x - this.x * v.z,
		    this.x * v.y - this.y * v.x);
	},

	// return a new copy of this vector 
	clone : function(){
		return new rjs.Vector3D( this.x, this.y, this.z )
	}
};

rjs.Object3D = function( position ){
	this.position = position;
};

rjs.Object3D.prototype = {

};