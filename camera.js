/**
 *
 * Camera3D object
 *
 */
Blue.Camera3D = function (pos,at,zoom) {
	this.position = pos || new Blue.Vector3D();
	this.at = at || new Blue.Vector3D();
	this.up = new Blue.Vector3D(0,1,0);
    if(pos) this.setPosition(pos.x,pos.y,pos.z);
    if(at) this.lookAt(at);
	this.zoom = zoom || 1;
	this.fov = 50;
};

Blue.Camera3D.prototype = {
    _updateMatrix: function ()
	{
	    this.z = this.at.proj(this.position);
		this.fov = -this.z.norm() * this.zoom;
		this.z.normalize();
		this.x = this.up.cross(this.z);
		this.x.normalize();
		this.y = this.z.cross(this.x);
	},

	/*
	 * Multiplies a point (u,v,w) (in world space) by the camera matix
	 * which applies a 3D perspective projection to the point
	 */
	project: function (u,v,w) { 
		w = w || 0; // z component can be omited for fixed 2D image
		
	    // turn world coordinates into camera coordinates
	    u -= this.position.x;
		v -= this.position.y;
		w -= this.position.z;

		var x = this.x.x * u + this.x.y * v + this.x.z * w,
	        y = this.y.x * u + this.y.y * v + this.y.z * w,
	        z = this.z.x * u + this.z.y * v + this.z.z * w;
		
		// apply projection & shift to fit viewport
		return new Blue.Vector3D(this.at.x + this.fov * x/z, this.at.y + this.fov * y/z, 1 );
	},
	
	setX : function(v) { this.position.x = v; this._updateMatrix(); },
	setY : function(v) { this.position.y = v; this._updateMatrix(); },
	setZ : function(v) { this.position.z = v; this._updateMatrix(); },
	zoomify : function(z) { this.zoom = z; this._updateMatrix(); },
	
    setPosition: function(x,y,z) {
		this.position.set(new Blue.Vector3D(x,y,z));
		this._updateMatrix();
	},

	lookAt  : function(v) {
		this.at.set(v);
		this._updateMatrix();
	},

	rotateOnAxis : function(axis,angle){
		angle *= Math.PI / 180;
		this.up = this.up.multiply( Math.cos(angle) )
			.add( axis.cross( this.up ).multiply( Math.sin(angle)) )
			.add( axis.multiply( axis.dot( this.up ) * (1 - Math.cos(angle))) )
		this._updateMatrix();
	},

	rotateX : function(){
		var v = new Blue.Vector3D(1,0,0);
		return function(angle){
			return this.rotateOnAxis(v,angle);
		};
	}(),

	rotateY : function(){
		var v = new Blue.Vector3D(0,1,0);
		return function(angle){
			return this.rotateOnAxis(v,angle);
		};
	}(),

	rotateZ : function(){
		var v = new Blue.Vector3D(0,0,1);
		return function(angle){
			return this.rotateOnAxis(v,angle);
		};
	}(),

	translateOnAxis : function(axis,distance){},

	translateX : function(distance){
		this.position.x += distance;
		this._updateMatrix();
	},

	translateY : function(distance){
		this.position.y += distance;
		this._updateMatrix();
	},

	translateZ : function(distance){
		this.position.z += distance;
		this._updateMatrix();
	},

	transformOrigin : function(){

	},

	translateOriginZ : function(distance){
		this.at.z += distance;
		this._updateMatrix();
	},

	perspectiveOrigin : function(x,y) {
		this.position.set(new Blue.Vector3D( x, y, this.position.z ) )
		this._updateMatrix();
	},

	perspective : function(z){
		this.position.z = z;
		this._updateMatrix();
	}

};