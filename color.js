/**
 *
 * A set of unified color classes
 *
 * by @jonbrennecke
 *
 */
R.clr = R.clr || {};


R.clr.rgb = function(rgb) {
	this.r = rgb.r || 0;
	this.g = rgb.g || 0;
	this.b = rgb.b || 0;
};

R.clr.rgb.prototype = {

	/**
	 * Convert rgb to hsv
	 *
	 * @see http://en.wikipedia.org/wiki/HSL_and_hsv#General_approach
	 * @return { R.clr.hsv } - hsv object
	 */
	toHSV : function() {
		var rgb = { r : this.r/255, g : this.g/255, b : this.b/255 },
		max = Math.max(rgb.r, Math.max(rgb.g, rgb.b ) ),
		min = Math.min(rgb.r, Math.min(rgb.g, rgb.b ) ),
		chroma = max - min;
		if(chroma === 0) var hprime = 0;
		else if(max === rgb.r) var hprime = ((rgb.g-rgb.b)/chroma)%6;
		else if(max === rgb.g) var hprime = ((rgb.b-rgb.r)/chroma)+2;
		else if(max === rgb.b) var hprime = ((rgb.r-rgb.g)/chroma)+4;
		return new R.clr.hsv( { h : ~~(60*hprime), s : ~~((chroma ? (chroma/max) : 0)*100), v : ~~(max*100) } );
	},

	/**
	 * Convert rgb to hex
	 *
	 * @return { R.clr.hex } - hex object
	 */
	toHex : function() {
		var hex = "#";
		jQuery.each({ r : this.r, g : this.g, b : this.b }, function(i, val) {
			var component = (~~val).toString(16);
			hex = hex + ( component.length == 1 ? "0" + component : component );
		});
		return new R.clr.hex(hex);
	}
};

R.clr.hsv = function(hsv) {
	this.h = hsv.h || 0;
	this.s = hsv.s || 0;
	this.v = hsv.v || 0;
};

R.clr.hsv.prototype = {

	/**
	 * Convert hsv to rgb
	 *
	 * @see http://en.wikipedia.org/wiki/HSL_and_hsv#General_approach
	 * @return { R.clr.rgb } - rgb object
	 */
	toRGB : function() {
		var chroma = this.v * this.s,
			hprime = this.h/60,
			x = chroma*(1 - Math.abs(hprime%2 - 1)),
			m = this.v - chroma;
		if(hprime >= 0 && hprime < 1) var rgb = { r : chroma, g : x, b : 0 };
		else if(hprime >= 1 && hprime < 2) var rgb = { r : x, g : chroma, b : 0 };
		else if(hprime >= 2 && hprime < 3) var rgb = { r : 0, g : chroma, b : x };
		else if(hprime >= 3 && hprime < 4) var rgb = { r : 0, g : x, b : chroma };
		else if(hprime >= 4 && hprime < 5) var rgb = { r : x, g : 0, b : chroma };
		else if(hprime >= 5 && hprime < 6) var rgb = { r : chroma, g : 0, b : x };
		else var rgb = { r : 0, g : 0, b : 0 };
		rgb.r = ~~((rgb.r+m)*255); rgb.g = ~~((rgb.g+m)*255); rgb.b = ~~((rgb.b+m)*255);
		return new R.clr.rgb(rgb);
	},

	/**
	 * Convert hsv to hex
	 *
	 * @return { R.clr.hex } - hex object
	 */
	toHex : function() {
		return this.toRGB().toHex();
	}
};

R.clr.hex = function(value) {
	// validate hex
	var test = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
	this.value = test ? value : "#ffffff";
};

R.clr.hex.prototype = {
	/**
	 * Convert hex to hsv
	 *
	 * @return { R.clr.hsv } - hsv object
	 */
	toHSV : function() {
		return this.toRGB().toHSV();
	},

	/**
	 * Convert hex to rgb
	 *
	 * @return { R.clr.rgb } - rgb object
	 */
	toRGB : function() {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.value);
	    var rgb = result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	    return new R.clr.rgb(rgb);
	},

	/**
	 * Invert the hex's color
	 *
	 * @return { R.clr.hex } - a new hex object with inverted color
	 */
	invert : function() {
		var invertHex = (0xFFFFFF ^ (~~('0x' + this.value.split("#")[1]))).toString(16);         
	    invertHex = ("000000" + invertHex).slice(-6); 
	    invertHex = "#" + invertHex;                
	    return new R.clr.hex(invertHex);
	}
};