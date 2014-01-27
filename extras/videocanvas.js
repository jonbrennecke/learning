Blue.VideoCanvas = function(){

	this.c = document.createElement('canvas');
	this.ctx = this.c.getContext('2d');
	this.c.width = 640;
	this.c.height = 480;

	$(document.body).append(this.c)

	var attributes = {
		id: '',
		'class' : '',
		width: '640',
		height : '480',
		controls : false,
		autoplay : false,
		preload : true,
		type : "video/mp4",
		src : 'happyfit2.mp4'
	}

	this.element = $('<video/>').attr(attributes)
	this.video = this.element.get(0);

	this.video.onloadedmetadata = function(){

		// do stuff like set height/width

		this.video.oncanplay = function(){
			this.video.play()
			this.ctx.drawImage(this.video,0,0,c.width,c.height);
			var frame = this.ctx.getImageData(0,0,c.width,c.height);
			
			if( this.video.paused || this.video.ended ) return;
				// this.computeFrame();
				window.requestAnimationFrame( function(){
					// this.getFrame();
				} );

		}.bind(this);
	}.bind(this);

	this.video.load()

};

Blue.VideoCanvas.prototype = {

};