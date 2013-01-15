define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang"
], function(declare, lang) {
	
// calculating number of tiles for each zoom
var numTiles = [1];
for (var z=1; z<20; z++) {
	numTiles[z] = 2*numTiles[z-1];
}

return declare(null, {
	
	init: function() {
		var ymapLayer = new ymaps.Layer("", {projection: ymaps.projection.sphericalMercator});
		ymapLayer.getTileUrl = lang.hitch(this, function(tileNumber, zoom) {
			if (tileNumber[1]<0 || tileNumber[1]>=numTiles[zoom]) return;
			var y = tileNumber[1] ,
				x = tileNumber[0] % numTiles[zoom]
			;
			if (x<0) {
				x = numTiles[zoom] + x;
			}
			var _1 = this.yFirst ? y : x,
				_2 = this.yFirst ? x : y
			;
			return this.url[_2 % this.numUrls]+"/"+zoom+"/"+_1+"/"+_2+".png";
		});
		this.map.engine.ymap.layers.add(ymapLayer);
	}
});

});
