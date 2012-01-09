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

var Y = window.YMaps;

var engineEvents = {onclick: "Click", onmouseover: "MouseEnter", onmouseout: "MouseLeave"};

var supportedLayers = {
	ROADMAP: "MAP",
	SATELLITE: "SATELLITE",
	HYBRID: "HYBRID"
};

return declare([Engine], {
	
	ymap: null,
	
	constructor: function(kwArgs) {
		this._require = require;
		// set ignored dependencies
		lang.mixin(this.ignoredDependencies, {"Highlight": 1, "Tooltip": 1});
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
				propagateEvents: true
			});
			ymap.disableDblClickZoom();
			ymap.disableDragging();
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
			script.get({
				url: "http://api-maps.yandex.ru/1.1/index.xml",
				content: {
					loadByRequire: 1,
					key: this.map.ymapsKey || require.rawConfig.ymapsKey
				},
				load: lang.hitch(this, function() {
					YMaps.load(lang.hitch(this, function(){
						Placemark.init();
						Y = YMaps;
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
	
	prepare: function() {
		this.zoomTo( this.map.extent );
	},
	
	appendChild: function(child, feature) {
		this.ymap.addOverlay(child);
	},
	
	getTopContainer: function() {
		var features = this.ge.getFeatures();
		return this.ge;
	},
	
	connect: function(feature, event, context, method) {
		// normalize the callback function
		method = this.normalizeCallback(feature, event, context, method);
		var connections,
			featureType = feature.getType();
		if (featureType == "MultiPolygon" || featureType == "MultiLineString") {
			connections = [];
			feature.baseShapes[0].forEach(function(shape){
				connections.push( Y.Events.observe(shape, shape.Events[engineEvents[event]], method, context) );
			});
		}
		else {
			var shape = feature.baseShapes[0];
			connections = Y.Events.observe(shape, shape.Events[engineEvents[event]], method, context);
		}
		return connections;
	},
	
	disconnect: function(connections) {
		if (lang.isArray(connections)) {
			array.forEach(connections, function(connection){
				connection.cleanup();
			});
		}
		else connections.cleanup();
	},
	
	normalizeCallback: function(feature, event, context, method) {
		// summary:
		//		Normalizes callback function for events
		if (method) {
			method = lang.hitch(context, method);
		}
		else method = context;
		return function(shape, nativeEvent){
			method({
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	zoomTo: function(extent) {
		var yBounds = new Y.GeoBounds( new Y.GeoPoint(extent[0],extent[1]), new Y.GeoPoint(extent[2],extent[3]) );
		this.ymap.setBounds(yBounds);
	},
	
	destroy: function() {
		
	},
	
	enableLayer: function(layerId, enabled) {
		if (enabled && supportedLayers[layerId]) this.ymap.setType(Y.MapType[supportedLayers[layerId]]);
	}
});

});