
import { fetchData } from '../../lib/service';
import { useEffect, useState } from 'react';
import { getStopFromData, getStops } from '../../lib/service/stops';
import { useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { stopIcon } from '../Icon';
import { scheduleJob } from 'node-schedule';
import { getDateFromTime } from '../../lib/utils/date';
import { getCurrentTrips } from '../../lib/service/trips';
import { getLineFromData, getLines } from '../../lib/service/lines';
import { getDirectionLegSteps, getDirectionLegs } from '../../lib/service/direction';

export default function Map({ addAlert, showStops = false, showTrips = true }) {
    const [stops, setStops] = useState();
    const [lines, setLines] = useState();

    const [trips, setTrips] = useState();
    const [lastDate, setLastDate] = useState();

    const [loadMap, setLoadMap] = useState(false);

    const googleMapRef = useRef();
    const [map, setMap] = useState();

    const [drawn, setDrawn] = useState(false);

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
            const job = scheduleJob("0 * * * * *", () => {
                console.log("[top] Update show trips");
                setTrips(t => t.map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() > Date.now() })));
            });

            return () => job.cancel();
        }
    }, [trips]);

    useEffect(() => {
        if (!loadMap) return;

        const googleMap = new window.google.maps.Map(googleMapRef.current, {
            center: new window.google.maps.LatLng(46.20483, 6.1430388),
            zoom: 12,
            mapId: "AIzaSyCNeFDat_XR0e2ArKsisG8M_JdgVYy9vfI" // TO CHANGE
        });
        setMap(googleMap);
    }, [loadMap]);

    useEffect(() => {
        if (!map || !stops || !trips || drawn) return;

        (async () => {
            setDrawn(true);

            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

            const infoWindow = new window.google.maps.InfoWindow();

            if (showStops) {
                stops.forEach(stop => { // TODO: check if they are edited (not to redraw them)
                    const pin = new DOMParser().parseFromString(stopIcon, "image/svg+xml").documentElement; // TODO: improve icon/class management for markers

                    const marker = new AdvancedMarkerElement({ // TO CHANGE: advanced and create pin
                        position: { lat: stop.latitude, lng: stop.longitude },
                        map,
                        title: stop.name,
                        content: pin
                    });

                    marker.addListener("click", () => {
                        infoWindow.close();
                        infoWindow.setContent(marker.title);
                        infoWindow.open(marker.map, marker);
                    });
                });
            }

            if (showTrips) {
                for (const trip of trips) {
                    if (!trip.show) continue;

                    if (trip.line_id !== 51) continue; // DEBUGGING

                    const legs = await getDirectionLegs(trip.direction_id);
                    const steps = await getDirectionLegSteps(trip.direction_id);

                    legs.sort((a, b) => a.sequence - b.sequence);
                    steps.sort((a, b) => a.leg_id - b.leg_id || a.sequence - b.sequence);

                    /*const snappedPath = [];
                    steps.forEach((s, i) => {
                        snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
                        if (s.end_lat !== steps[i + 1]?.start_lat || s.end_lng !== steps[i + 1]?.start_lng) snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
                    });*/

                    console.log(legs);
                    const snappedPath = legs.map(l => new window.google.maps.LatLng(getStopFromData(l.origin_id, { stops }).latitude, getStopFromData(l.origin_id, { stops }).longitude));
                    snappedPath.push(new window.google.maps.LatLng(getStopFromData(legs[legs.length - 1].destination_id, { stops }).latitude, getStopFromData(legs[legs.length - 1].destination_id, { stops }).longitude));

                    const line = getLineFromData(trip.line_id, { lines })
                    const snappedPolyline = new window.google.maps.Polyline({
                        path: snappedPath,
                        strokeColor: line ? "rgb(" + line.color + ")" : "#0000FF",
                        strokeWeight: 5
                    });
                    snappedPolyline.setMap(map);

                    snappedPolyline.addListener("click", e => {
                        infoWindow.close();
                        infoWindow.setContent("Ligne: " + line?.name + " -> " + getStopFromData(trip.destination_id, { stops })?.name + "<br />Heure de départ: " + trip.departure_time + "<br />Heure d'arrivée: " + trip.arrival_time + "<br/>Voyage:" + trip.id);
                        infoWindow.setPosition(e.latLng);
                        infoWindow.open(snappedPolyline.map);
                    });

                    break; // DEBUGGING
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, stops, trips]);

    // TODO: https://www.cluemediator.com/draw-a-route-between-two-points-using-google-maps-api-in-react

    return (loadMap &&
        <div
            className="w-full h-full"
            ref={googleMapRef}
        >
        </div>
    );
}