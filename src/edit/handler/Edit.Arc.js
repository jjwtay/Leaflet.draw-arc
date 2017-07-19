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
		})
	},
	
	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup()
		}

		// Create center marker
		this._createMoveMarker()

		// Create edge marker
		this._createResizeMarker()
		
		// Create start Marker();
		this._createStartMarker()

		// Create end Marker
		this._createEndMarker()
	},
	
	_createMoveMarker: function () {
		//var center = this._shape.getLatLng();
        let center = this._shape.getCenter()
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
        this._moveMarker = this._createMarker(center, this.options.moveIcon)
	},

	_createResizeMarker: function () {
		let center = this._shape.getCenter()

		let bearing = (this._shape.getEndBearing() - this._shape.getStartBearing()) / 2
		
		let point = this._shape.computeDestinationPoint(
			center,
			this._shape.getRadius(),
			bearing
		) 

		this._resizeMarker = this._createMarker(point, this.options.resizeIcon)

	},
	
	_createStartMarker: function() {
		let center = this._shape.getCenter()

		let point = this._shape.computeDestinationPoint(
			center,
			this._shape.getRadius(),
			this._shape.getStartBearing()
		)

		this._startMarker = this._createMarker(point, this.options.startIcon)
	},

	_createEndMarker: function () {
		let center = this._shape.getCenter()

		let point = this._shape.computeDestinationPoint(
			center,
			this._shape.getRadius(),
			this._shape.getEndBearing()
		)

		this._endMarker = this._createMarker(point, this.options.endIcon)
	},

	_getRotateMarkerPoint: function (latlng) {
		let moveLatLng = this._moveMarker.getLatLng()
		let br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing())
		return br
	},
	
	_onMarkerDragStart: function (e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e)
		this._currentMarker = e.target
	},
	
	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng)
		} else if (marker === this._resizeMarker) {
			this._resize(latlng)
		} else if (marker === this._startMarker) {
			this._restart(latlng)
		} else {
			this._end(latlng)
		}

		this._shape.redraw()
	},

	_move: function (latlng) {
        this._shape.setCenter(latlng)
        this._shape.setLatLngs(this._shape.getLatLngs())
		
		// Move the resize marker
		this._repositionResizeMarker()
		
		// Move the rotate marker
		//this._repositionRotateMarker();
		this._repositionStartMarker()

		this._repositionEndMarker()
	},

	_resize: function (latlng) {
		//let moveLatLng = this._moveMarker.getLatLng()
		let radius = this._shape.getCenter().distanceTo(latlng)

		this._shape.setRadius(radius)
		this._shape.setLatLngs(this._shape.getLatLngs())

		this._repositionStartMarker()
		this._repositionEndMarker()

	},

	_restart: function (latlng) {
		let moveLatLng = this._shape.getCenter()
		
		let pc = this._map.project(moveLatLng)
		let ph = this._map.project(latlng)
		let v = [ph.x - pc.x, ph.y - pc.y]

		let newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

		this._shape.setStartBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())
		
		// Move the resize marker
		this._repositionResizeMarker()
		this._repositionStartMarker()
	
	},

	_end: function (latlng) {
		let moveLatLng = this._shape.getCenter()
		
		let pc = this._map.project(moveLatLng)
		let ph = this._map.project(latlng)
		let v = [ph.x - pc.x, ph.y - pc.y]

		let newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI
		this._shape.setEndBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())
		
		// Move the resize marker
		this._repositionResizeMarker()
		this._repositionEndMarker()

	},
	
	_repositionResizeMarker: function () {
		let bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2
		let point = this._shape.computeDestinationPoint(
			this._shape.getCenter(),
			this._shape.getRadius(),
			bearing
		)

		this._resizeMarker.setLatLng(point)
	},
	
	_repositionStartMarker: function () {
		let start = this._shape.computeDestinationPoint(
			this._shape.getCenter(),
			this._shape.getRadius(),
			this._shape.getStartBearing()
		)
		this._startMarker.setLatLng(start)
	},

	_repositionEndMarker: function () {
		let end = this._shape.computeDestinationPoint(
			this._shape.getCenter(),
			this._shape.getRadius(),
			this._shape.getEndBearing()
		)
		this._endMarker.setLatLng(end)
	}
})

L.Arc.addInitHook(function () {
	if (L.Edit.Box) {
		this.editing = new L.Edit.Arc(this)

		if (this.options.editable) {
			this.editing.enable()
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks()
		}
	})

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks()
		}
	})
})