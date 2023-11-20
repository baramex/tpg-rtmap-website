import { useEffect, useState } from "react";
import { fetchData } from "../../lib/service";
import { getDirectionLegSteps } from "../../lib/service/direction";
import { getLineFromData } from "../../lib/service/lines";

export default function Trip({ trip, lines, map, addAlert }) {
    const [line, setLine] = useState();
    const [steps, setSteps] = useState();

    const [element, setElement] = useState();

    useEffect(() => {
        fetchData(addAlert, s => setSteps(s.sort((a, b) => a.leg_id - b.leg_id || a.sequence - b.sequence)), getDirectionLegSteps, true, trip.direction_id);
        setLine(getLineFromData(trip.line_id, { lines }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (steps && !element) {
            const snappedPath = [];
            steps.forEach((s, i) => {
                snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
                if (s.end_lat !== steps[i + 1]?.start_lat || s.end_lng !== steps[i + 1]?.start_lng) snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
            });

            setElement(new window.google.maps.Polyline({
                path: snappedPath,
                strokeColor: line ? "rgb(" + line.color + ")" : "#0000FF",
                strokeWeight: 5,
                strokeOpacity: .6,
                zIndex: 0,
                map
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps]);
}