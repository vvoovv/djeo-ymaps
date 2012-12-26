define([
	"dojo/_base/declare"
], function(declare) {

return declare(null, {

	process: function(event){
		var balloon = this.map.engine.ymap.balloon,
			feature = event.feature,
			cs = feature.reg.cs,
			content = cs.info ? cs.info(feature) : this.content(feature)
		;
		balloon.open(event.nativeEvent.get("coordPosition"), {content: content});
	}

});

});