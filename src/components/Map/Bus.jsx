import { useEffect, useState } from "react";
import { fetchData } from "../../lib/service";
import { getCurrentPosition, getCurrentProgress, getTripStops } from "../../lib/service/trips";
import { getDirectionLegSteps, getDirectionLegs } from "../../lib/service/direction";
import { getLineFromData } from "../../lib/service/lines";

export default function Bus({ trip, map, lines, addAlert }) {
    const [line, setLine] = useState();
    const [tripStops, setTripStops] = useState();
    const [legs, setLegs] = useState();
    const [steps, setSteps] = useState();

    const [position, setPosition] = useState();

    const [element, setElement] = useState();

    useEffect(() => {
        fetchData(addAlert, setTripStops, getTripStops, true, trip.id);
        fetchData(addAlert, l => setLegs(l.sort((a, b) => a.sequence - b.sequence)), getDirectionLegs, true, trip.direction_id);
        fetchData(addAlert, s => setSteps(s.sort((a, b) => a.leg_id - b.leg_id || a.sequence - b.sequence)), getDirectionLegSteps, true, trip.direction_id);
        setLine(getLineFromData(trip.line_id, { lines }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (position) {
            if (!element) {
                setElement(new window.google.maps.Marker({
                    fillColor: line ? "rgb(" + line.color + ")" : "#0000FF", // TODO
                    fillOpacity: .8,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                    },
                    label: line.name,
                    map,
                    position,
                    zIndex: 50,
                }));
            }
            else {
                element.setPosition(position);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    useEffect(() => {
        if (tripStops && legs && steps) {
            const int = setInterval(() => {
                let p = getCurrentPosition(legs, steps, getCurrentProgress(tripStops));
                if (p) setPosition(p);
                else console.warn("No bus position found for trip " + trip.id);
            }, 1000);

            return () => clearInterval(int);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripStops, legs, steps]);
}