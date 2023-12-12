
import { fetchData } from '../../lib/service';
import { Fragment, useEffect, useState } from 'react';
import { getStops } from '../../lib/service/stops';
import { useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { scheduleJob } from 'node-schedule';
import { getDateFromTime } from '../../lib/utils/date';
import { getCurrentTrips } from '../../lib/service/trips';
import { getLines } from '../../lib/service/lines';
import Bus from './Bus';
import Trip from './Trip';
import Stop from './Stop';

export default function Map({ addAlert, showStops = false, showTrips = true, showBus = false }) {
    const [stops, setStops] = useState();
    const [lines, setLines] = useState();

    const [trips, setTrips] = useState();
    const [lastDate, setLastDate] = useState();

    const [loadMap, setLoadMap] = useState(false);

    const [infoWindow, setInfoWindow] = useState();
    const [markerLib, setMarkerLib] = useState();

    const googleMapRef = useRef();
    const [map, setMap] = useState();

    useEffect(() => {
        const options = {
            apiKey: "AIzaSyCNeFDat_XR0e2ArKsisG8M_JdgVYy9vfI",
            libraries: ["marker"]
        }

        new Loader(options).load().then(() => { setLoadMap(true) });

        fetchData(addAlert, setStops, getStops);
        fetchData(addAlert, setLines, getLines);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const date = Math.round(Date.now() / 1000);

        const interval = setInterval(() => {
            console.log("[top] Update new trips"); // TODO: test
            fetchData(addAlert, trips => { setLastDate(date); setTrips(t => trips.filter(a => !t.some(b => a.id === b.id)).concat(t).map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() >= Date.now() })).sort((a, b) => a.line_id - b.line_id)); }, getCurrentTrips, true, 2, date, lastDate);
        }, 1000 * 60 * 2);

        fetchData(addAlert, trips => { setLastDate(date); setTrips(trips.map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() >= Date.now() })).sort((a, b) => a.line_id - b.line_id)); }, getCurrentTrips, true, 2, date);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (trips) {
            const job = scheduleJob("0 * * * * *", () => { // WARNING: for loop: update local trips, what will happen ??
                console.log("[top] Update show trips");
                setTrips(t => t.map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() > Date.now() })));
            });

            return () => job.cancel();
        }
    }, [trips]);

    useEffect(() => {
        if (!loadMap) return;

        window.google.maps.importLibrary("marker").then(setMarkerLib);
        setInfoWindow(new window.google.maps.InfoWindow());

        const googleMap = new window.google.maps.Map(googleMapRef.current, {
            center: new window.google.maps.LatLng(46.20483, 6.1430388),
            zoom: 12,
            mapId: "AIzaSyCNeFDat_XR0e2ArKsisG8M_JdgVYy9vfI" // TO CHANGE
        });
        setMap(googleMap);
    }, [loadMap]);

    return (loadMap &&
        <div
            className="w-full h-full"
            ref={googleMapRef}
        >
            {trips?.filter(a => a.show).map(a => (<Fragment key={a.id}>
                {showBus && markerLib && infoWindow && <Bus key={a.id + "b"} trip={a} map={map} lines={lines} AdvancedMarkerElement={markerLib.AdvancedMarkerElement} infoWindow={infoWindow} addAlert={addAlert} />}
                {showTrips && infoWindow && <Trip key={a.id + "t"} trip={a} map={map} lines={lines} stops={stops} infoWindow={infoWindow} addAlert={addAlert} />}
            </Fragment>))}

            {showStops && markerLib && infoWindow && stops?.map(stop => (<Stop key={stop.id} stop={stop} AdvancedMarkerElement={markerLib.AdvancedMarkerElement} map={map} infoWindow={infoWindow} />))}
        </div>
    );
}