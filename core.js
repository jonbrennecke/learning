var Raw = Raw || { META:"3D Effects namespace" };

Raw.Vector3D = function(x,y,z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

Raw.Vector3D.prototype = {
	set : function(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	},

	// find the vector projection in the direction of v 
	proj : function(v){ return new Raw.Vector3D(v.x - this.x, v.y - this.y, v.z - this.z) }, // TODO rename!!!
    
    norm : function(){ return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z) },
	
	normalize: function(){
	    var n = this.norm();
		this.x /= n;
		this.y /= n;
		this.z /= n;
	},

	// subtract a vector 'v' from the vector 
	sub : function(v){
		return new Raw.Vector3D(this.x - v.x, this.y - v.y, this.z - v.z);
	},

	// add a vector 'v' to the vector
	add : function(v){
		return new Raw.Vector3D(this.x + v.x, this.y + v.y, this.z + v.z);
	},

	// multiply components of the vector by a scalar 's'
	multiply : function(s){
		return new Raw.Vector3D(this.x * s, this.y * s, this.z * s);
	},

	dot : function(v){
		return v.x * this.x + v.y * this.y + v.z * this.z;
	},
	
	cross : function(v){
	    return new Raw.Vector3D (
		    this.y * v.z - this.z * v.y,
		    this.z * v.x - this.x * v.z,
		    this.x * v.y - this.y * v.x);
	}
};

Raw.Object3D = function( position ){
	this.position = position;
};

Raw.Object3D.prototype = {

};