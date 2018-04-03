// @flow
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';
import {MapControl} from "react-leaflet";

export class LeafletSearch extends MapControl {

    createLeafletElement() {
        const googleProvider = new GoogleProvider({
            params: {
                key: '***REMOVED***',
            },
        });

        return GeoSearchControl({
            position: 'topright',
            style: 'button',
            provider: googleProvider,
            showMarker: false,
            showPopup: false,
            autoClose: false,
            keepResult: true,
            searchLabel: 'search',
            retainZoomLevel: false,
            animateZoom: true,
            notFoundMessage: 'Sorry, that address could not be found.',
            messageHideDelay: 3000,
            zoomLevel: 18,
            classNames: {
                container: 'leaflet-bar leaflet-control leaflet-control-geosearch',
                button: 'search',
                resetButton: 'reset',
                msgbox: 'leaflet-bar message',
                form: '',
                input: ''
            },
            autoComplete: true,
            autoCompleteDelay: 250,
        });
    }
}

export default LeafletSearch;
