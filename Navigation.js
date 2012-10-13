define([
	"dojo/_base/declare"
], function(declare) {

return declare(null, {

	enable: function(enable) {
		if (enable === undefined) enable = true;
		var ymap = this.map.engine.ymap;
		if (enable) {
			ymap.behaviors.enable(["drag", "dblClickZoom", "scrollZoom"]);
		}
		else {
			ymap.behaviors.disable(["scrollZoom", "dblClickZoom", "drag"]);
		}
	}
});

});