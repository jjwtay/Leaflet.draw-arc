L.Edit = L.Edit || {}

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

    _initMarkers () {
        if (!this._markerGroup) {
            this._markerGroup = new L.LayerGroup()
        }
        this._resizeMarkers = []

        // Create center marker
        this._createMoveMarker()

        // Create edge marker
        this._createResizeMarker()

        // Create start Marker();
        this._createStartMarker()

        // Create end Marker
        this._createEndMarker()

        //Create rotate Marker
        this._createRotateMarker()
    },

    _createMoveMarker () {
        const center = this._shape.getCenter()
        this._moveMarker = this._createMarker(center, this.options.moveIcon)
    },

    _createResizeMarker () {
        const bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,
            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getRadius(),
                bearing
            )

        this._resizeMarker = this._createMarker(point, this.options.resizeIcon)
    },

    _createStartMarker () {
        const point = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            this._shape.getRadius(),
            this._shape.getStartBearing()
        )

        this._startMarker = this._createMarker(point, this.options.startIcon)
    },

    _createEndMarker () {
        const point = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            this._shape.getRadius(),
            this._shape.getEndBearing()
        )

        this._endMarker = this._createMarker(point, this.options.endIcon)
    },

    _createRotateMarker () {
        const bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,

            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getRadius() * 1.3,
                bearing
            )

        this._rotateMarker = this._createMarker(point, this.options.rotateIcon)
    },

    _onMarkerDragStart (e) {
        L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e)
        this._currentMarker = e.target
    },

    _onMarkerDrag (e) {
        const marker = e.target,
            latlng = marker.getLatLng()

        if (marker === this._moveMarker) {
            this._move(latlng)
        } else if (marker === this._resizeMarker) {
            this._resize(latlng)
        } else if (marker === this._startMarker) {
            this._restart(latlng)
        } else if (marker === this._endMarker) {
            this._end(latlng)
        } else {
            this._rotate(latlng)
        }

        this._shape.redraw()
    },

    _move (latlng) {
        this._shape.setCenter(latlng)
        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _resize (latlng) {
        //let moveLatLng = this._moveMarker.getLatLng()
        const radius = this._shape.getCenter().distanceTo(latlng)

        this._shape.setRadius(radius)
        this._shape.setLatLngs(this._shape.getLatLngs())

        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionResizeMarker()
        this._repositionRotateMarker()
    },

    _restart (latlng) {
        const moveLatLng = this._shape.getCenter(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],

            newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

        this._shape.setStartBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _end (latlng) {
        const moveLatLng = this._shape.getCenter(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],

            newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

        this._shape.setEndBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarker()
        this._repositionEndMarker()
        this._repositionStartMarker()
        this._repositionRotateMarker()
    },

    _rotate (latlng) {
        const moveLatLng = this._shape.getCenter(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],
            newB = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360,
            halfAngle = (this._shape.getEndBearing() - this._shape.getStartBearing()) / 2,
            newStart = (newB - halfAngle),
            newEnd = (newStart + 2 * halfAngle)

        this._shape.setStartBearing(newStart)
        this._shape.setEndBearing(newEnd)
        this._shape.setLatLngs(this._shape.getLatLngs())


        this._repositionResizeMarker()
        this._repositionEndMarker()
        this._repositionStartMarker()
        this._repositionRotateMarker()
    },

    _repositionResizeMarker () {
        const bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,
            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getRadius(),
                bearing
            )

        this._resizeMarker.setLatLng(point)
    },

    _repositionStartMarker () {
        const start = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            this._shape.getRadius(),
            this._shape.getStartBearing()
        )
        this._startMarker.setLatLng(start)
    },

    _repositionEndMarker () {
        const end = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            this._shape.getRadius(),
            this._shape.getEndBearing()
        )
        this._endMarker.setLatLng(end)
    },

    _repositionRotateMarker () {
        const bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2

        const point = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            this._shape.getRadius() * 1.3,
            bearing
        )

        this._rotateMarker.setLatLng(point)
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
        /** Note: added check for _resizemarkers due to odd behavior
         *  when working out of react-leaflet and removing the map.
         */
        if (this.editing && this.editing.enabled() && this.editing._resizeMarkers) {
            this.editing.removeHooks()
        }
    })
})