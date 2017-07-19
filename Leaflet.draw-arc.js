var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

L.Draw.Arc = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'arc'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true // Whether to use the metric measurement system or imperial
	},

	initialize: function initialize(map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Arc.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.arc.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function _drawShape(latlng) {
		if (!this._shape) {

			var width = Math.max(this._startLatLng.distanceTo(latlng), 10);
			var length = width;
			this._shape = L.box(_extends({
				center: this._startLatLng,
				width: width,
				length: length,
				bearing: 0
			}, this.options.shapeOptions));
			this._map.addLayer(this._shape);
		} else {
			var bounds = new L.LatLngBounds(this._startLatLng, latlng);
			var _width = 2 * bounds.getNorthWest().distanceTo(bounds.getNorthEast());
			var height = _width;
			this._shape.setWidth(_width);
			this._shape.setLength(height);
			this._shape.setLatLngs(this._shape.getLatLngs());
		}
	},

	_fireCreatedEvent: function _fireCreatedEvent() {
		var box = L.box(_extends({}, this.options.shapeOptions, {
			center: this._startLatLng,
			width: this._shape.getWidth(),
			length: this._shape.getLength(),
			bearing: this._shape.getBearing()

		}));

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box);
	},

	_onMouseMove: function _onMouseMove(e) {
		var latlng = e.latlng,
		    showRadius = this.options.showRadius,
		    useMetric = this.options.metric,
		    radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			radius = this._shape.getWidth();

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.box.radius + ': ' + radius : ''
			});
		}
	}
});

L.Edit = L.Edit || {};

L.Edit.Arc = L.Edit.SimpleShape.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		}),
		startIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
		}),
		endIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
		}),
		rotateIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
		})
	},

	_initMarkers: function _initMarkers() {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();

		// Create start Marker();
		this._createStartMarker();

		// Create end Marker
		this._createEndMarker();

		//Create rotate Marker
		this._createRotateMarker();
	},

	_createMoveMarker: function _createMoveMarker() {
		//var center = this._shape.getLatLng();
		var center = this._shape.getCenter();
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function _createResizeMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getRadius(), bearing);

		this._resizeMarker = this._createMarker(point, this.options.resizeIcon);
	},

	_createStartMarker: function _createStartMarker() {
		var center = this._shape.getCenter();

		var point = this._shape.computeDestinationPoint(center, this._shape.getRadius(), this._shape.getStartBearing());

		this._startMarker = this._createMarker(point, this.options.startIcon);
	},

	_createEndMarker: function _createEndMarker() {
		var center = this._shape.getCenter();

		var point = this._shape.computeDestinationPoint(center, this._shape.getRadius(), this._shape.getEndBearing());

		this._endMarker = this._createMarker(point, this.options.endIcon);
	},

	_createRotateMarker: function _createRotateMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getRadius() * 1.3, bearing);

		this._rotateMarker = this._createMarker(point, this.options.rotateIcon);
	},

	/*_getRotateMarkerPoint: function (latlng) {
 	let moveLatLng = this._moveMarker.getLatLng()
 	let br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing())
 	return br
 },*/

	_onMarkerDragStart: function _onMarkerDragStart(e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
		this._currentMarker = e.target;
	},

	_onMarkerDrag: function _onMarkerDrag(e) {
		var marker = e.target,
		    latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else if (marker === this._resizeMarker) {
			this._resize(latlng);
		} else if (marker === this._startMarker) {
			this._restart(latlng);
		} else if (marker === this._endMarker) {
			this._end(latlng);
		} else {
			this._rotate(latlng);
		}

		this._shape.redraw();
	},

	_move: function _move(latlng) {
		this._shape.setCenter(latlng);
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},

	_resize: function _resize(latlng) {
		//let moveLatLng = this._moveMarker.getLatLng()
		var radius = this._shape.getCenter().distanceTo(latlng);

		this._shape.setRadius(radius);
		this._shape.setLatLngs(this._shape.getLatLngs());

		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionResizeMarker();
		this._repositionRotateMarker();
	},

	_restart: function _restart(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;

		this._shape.setStartBearing(newB);

		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},

	_end: function _end(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;
		this._shape.setEndBearing(newB);

		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarker();
		this._repositionEndMarker();
		this._repositionStartMarker();
		this._repositionRotateMarker();
	},

	_rotate: function _rotate(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;
		var oldB = (this._shape.getStartBearing() + this._shape.getEndBearing()) / 2;
		var angle = this._shape.getEndBearing() - this._shape.getStartBearing();

		var newStart = (newB - angle / 2) % 360;
		var newEnd = (newB + angle / 2) % 360;

		this._shape.setStartBearing(newStart);
		this._shape.setEndBearing(newEnd);
		this._shape.setLatLngs(this._shape.getLatLngs());

		this._repositionResizeMarker();
		this._repositionEndMarker();
		this._repositionStartMarker();
		this._repositionRotateMarker();
	},

	_repositionResizeMarker: function _repositionResizeMarker() {
		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;
		var point = this._shape.computeDestinationPoint(this._shape.getCenter(), this._shape.getRadius(), bearing);

		this._resizeMarker.setLatLng(point);
	},

	_repositionStartMarker: function _repositionStartMarker() {
		var start = this._shape.computeDestinationPoint(this._shape.getCenter(), this._shape.getRadius(), this._shape.getStartBearing());
		this._startMarker.setLatLng(start);
	},

	_repositionEndMarker: function _repositionEndMarker() {
		var end = this._shape.computeDestinationPoint(this._shape.getCenter(), this._shape.getRadius(), this._shape.getEndBearing());
		this._endMarker.setLatLng(end);
	},

	_repositionRotateMarker: function _repositionRotateMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getRadius() * 1.3, bearing);

		this._rotateMarker.setLatLng(point);
	}
});

L.Arc.addInitHook(function () {
	if (L.Edit.Box) {
		this.editing = new L.Edit.Arc(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});

L.drawLocal.draw.toolbar.buttons.box = 'Draw an Arc';

L.drawLocal.draw.handlers.box = {
	tooltip: {
		start: 'Click and drag to draw box.'
	},
	radius: 'Width (meters): '
};
