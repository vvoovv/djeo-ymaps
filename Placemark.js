define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"dojo/_base/array", // forEach, map
	"dojo/_base/Color",
	"djeo/common/Placemark"
], function(declare, lang, array, Color, P){

var Y = window.YMaps;

var Placemark = declare([P], {

	constructor: function(kwArgs) {
		lang.mixin(this, kwArgs);
	},

	makePoint: function(feature, coords) {
		return new Y.Placemark(coords, {
			hasBalloon: false,
			hideIconOnBalloonOpen: false
		});
	},

	makeLineString: function(feature, coords) {
		return this._makeLineString(coords);
	},

	_makeLineString: function(coords) {
		return new Y.Polyline(coords, {
			hasBalloon: false
		});
	},

	makePolygon: function(feature, coords) {
		return this._makePolygon(coords);
	},

	_makePolygon: function(coords) {
		return new Y.Polygon(coords, {
			hasBalloon: false
		});
	},
	
	makeMultiLineString: function(feature, coords) {
		var collection = new Y.GeoObjectCollection();
		array.forEach(coords, function(lineStringCoords){
			collection.add( this._makeLineString(lineStringCoords) );
		}, this);
		return collection;
	},
	
	makeMultiPolygon: function(feature, coords) {
		var collection = new Y.GeoObjectCollection();
		array.forEach(coords, function(polygonCoords){
			collection.add( this._makePolygon(polygonCoords) );
		}, this);
		return collection;
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyle = P.getSpecificShapeStyle(calculatedStyle.points, this.specificStyleIndex),
			placemark = feature.baseShapes[0],
			shapeType = P.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = P.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape = true,
			scale = P.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			iconImageHref = placemark.options.get("iconImageHref"),
			// options
			o = {}
		;

		if (!shapeType && src) isVectorShape = false;
		else if (!P.shapes[shapeType] && !iconImageHref)
			// set default value for the shapeType only if we haven't already styled the feature (!iconStyle.href)
			shapeType = P.defaultShapeType;

		// set size and offset
		var size = isVectorShape ? P.getSize(calculatedStyle, specificStyle, specificShapeStyle) : P.getImgSize(calculatedStyle, specificStyle, specificShapeStyle);
		if (size) {
			var anchor = isVectorShape ? [size[0]/2, size[1]/2] : P.getAnchor(calculatedStyle, specificStyle, specificShapeStyle, size);
			o.iconImageSize = [scale*size[0], scale*size[1]];
			o.iconImageOffset = [-scale*anchor[0], -scale*anchor[1]];
		}
		else if (iconImageHref) {
			// check if we can apply relative scale (rScale)
			var rScale = P.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (rScale !== undefined) {
				// getting current size anf offset
				size = placemark.options.get("iconImageSize");
				var offset = placemark.options.get("iconImageOffset");
				o.iconImageSize = [rScale*size[0], rScale*size[1]];
				o.iconImageOffset = [rScale*offset[0], rScale*offset[1]];
			}
		}

		var url = this._getIconUrl(isVectorShape, shapeType, src);
		if (url) o.iconImageHref = url;

		placemark.options.set(o);
	},
	
	applyLineStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.line,
			specificShapeStyle = P.getSpecificShapeStyle(calculatedStyle.lines, this.specificStyleIndex),
			polyline = feature.baseShapes[0]
		;

		var o = getStrokeOptions(polyline, calculatedStyle, specificStyle, specificShapeStyle);
		if (o) {
			polyline.options.set(o);
		}
	},

	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		var specificStyle = calculatedStyle.polygon,
			polygon = feature.baseShapes[0],
			fill = P.get("fill", calculatedStyle, specificStyle),
			fillOpacity = P.get("fillOpacity", calculatedStyle, specificStyle)
		;

		// options
		var o = getStrokeOptions(polygon, calculatedStyle, specificStyle);
		if (fill || fillOpacity!==undefined) {
			o = o || {};
			if (fill) {
				o.fillColor = convertColor(fill);
			}
			if (fillOpacity!==undefined) {
				o.fillOpacity = fillOpacity;
			}
		}
		if (o) {
			polygon.options.set(o);
		}
	},
	
	remove: function(feature) {

	},
	
	show: function(feature, show) {
		if (show) this.engine.ymap.geoObjects.add(feature.baseShapes[0]);
		else this.engine.ymap.geoObjects.remove(feature.baseShapes[0]);
	},

	setCoords: function(coords, feature) {
		feature.baseShapes[0].geometry.setCoordinates(coords);
	},
	
	makeText: function(feature, calculatedStyle) {
	},
	
	translate: function(newPoint, feature) {

	},

	rotate: function(orientation, feature) {

	}
});

Placemark.init = function() {
	Y = ymaps;
};

var convertColor = function(c) {
	return new Color(c).toHex();
};

var getStrokeOptions = function(shape, calculatedStyle, specificStyle, specificShapeStyle) {
	var stroke = P.get("stroke", calculatedStyle, specificStyle, specificShapeStyle),
		strokeWidth = P.get("strokeWidth", calculatedStyle, specificStyle, specificShapeStyle),
		strokeOpacity = P.get("strokeOpacity", calculatedStyle, specificStyle, specificShapeStyle)
	;

	if (stroke || strokeWidth!==undefined || strokeOpacity!==undefined) {
		// options
		var o = {};
		if (stroke) {
			o.strokeColor = convertColor(stroke);
		}
		if (strokeOpacity!==undefined) {
			o.strokeOpacity = strokeOpacity;
		}
		if (strokeWidth !== undefined) {
			o.strokeWidth = strokeWidth;
		}
		return o;
	}
};

return Placemark;
});
