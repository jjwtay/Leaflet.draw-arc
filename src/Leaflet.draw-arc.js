import './draw/handler/Draw.Arc'
import './edit/handler/Edit.Arc'

L.drawLocal.draw.toolbar.buttons.arc = 'Draw an Arc'

L.drawLocal.draw.handlers.arc = {
    tooltip: {
        start: 'Click to set Arc center.',
        line: 'Click to set Radius and Start Bearing.',
        end: 'Click to set End Bearing and create Arc'
    },
    radius: 'Radius (meters): ',
    bearing: 'Bearing (degrees): '
}