/**
 * A sphere of 'n' Hammersley points.
 * The Hammersley point algorithm creates a spiral twisted around the sphere 
 * and finds points along that spiral.
 * @link / http://www.cse.cuhk.edu.hk/~ttwong/papers/udpoint/udpoint.pdf
 *
 * @param radius { Number } - sphere radius
 * @param position { Vector3D } - position of the sphere's center
 * @param n { Number } - the number of points to be generated
 */
rjs.HammersleySphere = function( radius, position, n ){
	this.position = position;
	this.radius = radius;
	this.verts = [];

	// based on the algorithm in spherical coordinates (theta, phi) from 
	// "Distributing many points on a sphere" by E.B. Saff and A.B.J. Kuijlaars,
	// Mathematical Intelligencer 19.1 (1997) 5--11.
	// retrieved from / http://www.math.niu.edu/~rusin/known-math/97/spherefaq
	for(var i = 0, phiLast = 0; i < n; i++ ){
		var h = -1 + 2 * ( i - 1 ) / ( n - 1 ),
		theta = Math.acos(h),
		phi = i == 1 ? 0 : ( phiLast + 3.6 / Math.sqrt( n * (1-h*h))) % ( 2 * Math.PI );

		phiLast = phi;

		// convert back to cartesian coordinates and scale from (-1,1) to (pos-radius,pos+radius)
		this.verts.push( new rjs.Vector3D( 
			this.position.x + radius * Math.sin( phi ) * Math.sin( theta ),
			this.position.y + radius * Math.cos( theta ),
			this.position.z + radius * Math.cos( phi ) * Math.sin( theta )
			))
	}

};