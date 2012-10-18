define([
	"dojo/_base/declare"
], function(declare) {
	
function _onBoundsChange(event) {
	if (event.get("newZoom") != event.get("oldZoom")) {
		this._onZoom();
	}
}

return declare(null, {

	enable: function(enable) {
		if (enable === undefined) enable = true;
		var ymap = this.map.engine.ymap;
		if (enable) {
			ymap.behaviors.enable(["drag", "dblClickZoom", "scrollZoom"]);
			ymap.events.add('boundschange', _onBoundsChange, this);
		}
		else {
			ymap.behaviors.disable(["scrollZoom", "dblClickZoom", "drag"]);
			ymap.events.remove('boundschange', _onBoundsChange, this);
		}
	}
});

});