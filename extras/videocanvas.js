/**
 *
 * 
 *
 */
Blue.VideoCanvas = function(){

	this.c = document.createElement('canvas');
	this.ctx = this.c.getContext('2d');
	this.c.width = 640;
	this.c.height = 480;

	$(document.body).append(this.c)

	var attributes = {
		id: '',
		'class' : '',
		width: 640,
		height : 480,
		controls : false,
		autoplay : false,
		preload : true,
		type : "video/mp4",
		src : 'bunny.mp4'
	}

	this.element = $('<video/>').attr(attributes)
	this.video = this.element.get(0);

	// just for testing
	this.sphere = new Blue.HammersleySphere( 150, new Blue.Vector3D( this.c.width/2, this.c.height/2, 0 ), 275000 );


	this.video.onloadedmetadata = function(){

		// do stuff like set height/width here

		this.video.oncanplay = function(){
			this.video.play()
			this.ctx.drawImage(this.video,0,0,this.c.width,this.c.height);
			var frame = this.ctx.getImageData(0,0,this.c.width,this.c.height);
			
			this.getFrame();

		}.bind(this);
	}.bind(this);

	this.video.load()

};

Blue.VideoCanvas.prototype = {

	constructor : Blue.VideoCanvas,

	getFrame : function(){
		if( this.video.paused || this.video.ended ) return;
		this.computeFrame()
		window.requestAnimationFrame( this.getFrame.bind(this) );
	},

	computeFrame : function(){

		// draw from the html '<video>' element to the canvas
		this.ctx.drawImage(this.video,0,0,this.c.width,this.c.height);

		// get the ImageData array back from the canvas
		var frame = this.ctx.getImageData(0,0,this.c.width,this.c.height);

	    var newimg = this.ctx.createImageData(this.c.width,this.c.height);

		for(var i=0;i<this.sphere.verts.length;i++){
			if( this.sphere.verts[i].z < 0 ) {

				var d = this.sphere.verts[i].proj( this.sphere.position ).normalize();

				var	u = Math.round( ( 0.5 + ( Math.atan2( d.z, d.x ) / ( 2 * Math.PI ) ) ) * this.c.width ),
					v = Math.round( ( 0.5 - ( Math.asin( d.y ) / Math.PI ) ) * this.c.height );

				// find the coordinates in picture space
				var k = 4 * ( u + v * this.c.width ),
					j = 4 * ( Math.round( this.sphere.verts[i].x ) + Math.round( this.sphere.verts[i].y ) * this.c.width );

				newimg.data[j] = ( frame.data[k] - this.sphere.verts[i].z ); // r
				newimg.data[j+1] = ( frame.data[k+1] - this.sphere.verts[i].z ); // g
				newimg.data[j+2] = ( frame.data[k+2] - this.sphere.verts[i].z ); // b
				newimg.data[j+3] = 255;  // a
			}
		}

		this.ctx.putImageData(newimg,0,0,0,0,this.c.width,this.c.height);
	}
};