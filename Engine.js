define([
	"require",
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch, isArray
	"dojo/_base/array", // forEach
	"dojo/aspect", // after
	"dojo/io/script", // get
	"djeo/Engine",
	"./Placemark"
], function(require, declare, lang, array, aspect, script, Engine, Placemark){

var Y = window.ymaps;

var engineEvents = {click: "click", mouseover: "mouseenter", mouseout: "mouseleave"};

var supportedLayers = {
	roadmap: "MAP",
	satellite: "SATELLITE",
	hybrid: "HYBRID"
};

return declare([Engine], {
	
	ymap: null,
	
	constructor: function(kwArgs) {
		this._require = require;
		// set ignored dependencies
		lang.mixin(this.ignoredDependencies, {"Highlight": 1, "Tooltip": 1});
		this._supportedLayers = supportedLayers;
		// initialize basic factories
		this._initBasicFactories(new Placemark({
			map: this.map,
			engine: this
		}));
	},
	
	initialize: function(/* Function */readyFunction) {
		if (Y) {
			// the first case: Yandex Maps API is completely loaded
			this.map.projection = "EPSG:4326";
			var ymap = new Y.Map(this.map.container, {
				propagateEvents: true,
				center: [0, 0],
				zoom: 0
			});
			ymap.behaviors.disable(["drag", "dblClickZoom"]);
			this.ymap = ymap;
			
			this.initialized = true;
			readyFunction();
		}
		else if (this._initializing) {
			// the second case: Yandex Maps API is being loaded
			// wait till initializing function is called
			aspect.after(this, "_initializing", lang.hitch(this, function(){
				this.initialize(readyFunction);
			}));
		}
		else {
			this._initializing = function(){};
			var content = {
					coordorder: "longlat",
					load: "package.full",
					lang: "ru-RU"
				},
				// check if we've got a key
				key = this.map.ymapsKey || require.rawConfig.ymapsKey
			;
			if (key) content.key = key;
			script.get({
				url: "http://api-maps.yandex.ru/2.0/",
				content: content,
				load: lang.hitch(this, function() {
					ymaps.ready(lang.hitch(this, function(){
						Placemark.init();
						Y = ymaps;
						this._initializing();
						delete this._initializing;
						this.initialize(readyFunction);
					}));
				})
			});
		}
	},

	createContainer: function(feature) {
	},
	
	appendChild: function(child, feature) {
		this.ymap.geoObjects.add(child);
	},
	
	onForFeature: function(feature, event, method, context) {
		// normalize the callback function
		method = this.normalizeCallback(feature, event, method, context);
		var shape = feature.baseShapes[0];
		shape.events.add(engineEvents[event], method, context);
		return [[shape, engineEvents[event], method, context]];
	},
	
	disconnect: function(connections) {
		array.forEach(connections, function(con){
			con[0].events.remove(con[1], con[2], con[3]);
		});
	},
	
	normalizeCallback: function(feature, event, method, context) {
		// summary:
		//		Normalizes callback function for events
		return function(shape, nativeEvent){
			method.call(context, {
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	zoomTo: function(extent) {
		this.ymap.setBounds([[extent[0],extent[1]], [extent[2],extent[3]]]);
	},
	
	destroy: function() {
		
	},
	
	enableLayer: function(layerId, enabled) {
		layerId = layerId.toLowerCase();
		if (enabled && supportedLayers[layerId]) this.ymap.setType(Y.MapType[supportedLayers[layerId]]);
	}
});

});