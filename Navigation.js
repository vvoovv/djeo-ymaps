define([
	"dojo/_base/declare"
], function(declare) {

return declare(null, {

	enable: function(enable) {
		if (enable === undefined) enable = true;
		var ymap = this.map.engine.ymap;
		if (enable) {
			ymap.enableDragging();
			ymap.enableDblClickZoom();
			ymap.enableScrollZoom();
		}
		else {
			ymap.disableScrollZoom();
			ymap.disableDblClickZoom();
			ymap.disableDragging();
		}
	}
});

});