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

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Arc.TYPE

		this._initialLabelText = L.drawLocal.draw.handlers.arc.tooltip.start

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options)
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			
			let width = Math.max(this._startLatLng.distanceTo(latlng), 10)
			let length = width
			this._shape = L.box({
                center: this._startLatLng,
                width,
                length,
				bearing: 0,
                ...this.options.shapeOptions
            })
			this._map.addLayer(this._shape);
		} else {
			let bounds = new L.LatLngBounds(this._startLatLng, latlng)
			let width = 2 * bounds.getNorthWest().distanceTo(bounds.getNorthEast())
			let height = width
			this._shape.setWidth(width)
			this._shape.setLength(height)
			this._shape.setLatLngs(this._shape.getLatLngs())
		}
	},

	_fireCreatedEvent: function () {
		let box = L.box({
			...this.options.shapeOptions,
            center: this._startLatLng,
            width: this._shape.getWidth(),
            length: this._shape.getLength(),
			bearing: this._shape.getBearing(),

        })

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box)
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng,
			showRadius = this.options.showRadius,
			useMetric = this.options.metric,
			radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);


			radius = this._shape.getWidth()

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.box.radius + ': ' + radius : ''
			});
		}
	}
});