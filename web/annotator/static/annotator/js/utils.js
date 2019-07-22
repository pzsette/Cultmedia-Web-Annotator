// JavaScript Document

utils = {
	/*xmlToString: function (elem){
			var serialized;
		
			try {
				// XMLSerializer exists in current Mozilla browsers
				serializer = new XMLSerializer();
				serialized = serializer.serializeToString(elem);
			} 
			catch (e) {
				// Internet Explorer has a different approach to serializing XML
				serialized = elem.xml;
			}
			return serialized;
	},*/
	colorToHex: function(color) {
		if (color.substr(0, 1) === '#') {
			return '0x' + color.substr(1);
		}
		var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
		
		var red = parseInt(digits[2]);
		var green = parseInt(digits[3]);
		var blue = parseInt(digits[4]);
		
		var rgb = blue | (green << 8) | (red << 16);
		return digits[1] + '0x' + rgb.toString(16);
	},
    /*
	colorToHex2: function(color) {
			var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
			var red = parseInt(digits[2]);
			var green = parseInt(digits[3]);
			var blue = parseInt(digits[4]);
			var hexFunction = this.toHex;
			return '0x' + hexFunction(red)+hexFunction(green)+hexFunction(blue);
	},
			
	toHex: function(N) {
 		if (N==null) return "00";
 			N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 			N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 			return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
		}
	*/
}