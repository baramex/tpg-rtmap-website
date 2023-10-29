
import { fetchData } from '../../lib/service';
import { useEffect, useState } from 'react';
import { getStops } from '../../lib/service/stops';
import { useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { stopIcon } from '../Icon';

export default function Map({ addAlert, showStops = true }) {
    const [stops, setStops] = useState();

    const [loadMap, setLoadMap] = useState(false);

    const googleMapRef = useRef();
    const [map, setMap] = useState();

    useEffect(() => {
        const options = {
            apiKey: "AIzaSyCNeFDat_XR0e2ArKsisG8M_JdgVYy9vfI",
            libraries: ["marker"]
        }

        new Loader(options).load().then(() => { setLoadMap(true) });

        fetchData(addAlert, setStops, getStops);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loadMap) return;

        const googleMap = new window.google.maps.Map(googleMapRef.current, {
            center: new window.google.maps.LatLng(46.20483, 6.1430388),
            zoom: 12,
            mapId: "DEMO_MAP_ID" // TO CHANGE
        });
        setMap(googleMap);
    }, [loadMap]);

    useEffect(() => {
        if (!map || !stops) return;

        (async () => {
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

            const infoWindow = new window.google.maps.InfoWindow();

            if (showStops) {
                stops.forEach(stop => {
                    const pinIcon = new DOMParser().parseFromString(stopIcon, "image/svg+xml").documentElement; // TODO: improve icon/class management for markers

                    const marker = new AdvancedMarkerElement({ // TO CHANGE: advanced and create pin
                        position: { lat: stop.latitude, lng: stop.longitude },
                        map,
                        title: stop.name,
                        content: pinIcon
                    });

                    marker.addListener("click", () => {
                        infoWindow.close();
                        infoWindow.setContent(marker.title);
                        infoWindow.open(marker.map, marker);
                    });
                });
            }
        })();
    }, [map, stops]);

    // TODO: https://www.cluemediator.com/draw-a-route-between-two-points-using-google-maps-api-in-react

    return (loadMap &&
        <div
            className="w-full h-full"
            ref={googleMapRef}
        >
        </div>
    );
}