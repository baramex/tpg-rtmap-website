import { useEffect, useState } from "react";
import { fetchData } from "../../lib/service";
import { getDirectionLegSteps } from "../../lib/service/direction";
import { getLineFromData } from "../../lib/service/lines";
import { LineBadge } from "../Line/Line";
import * as ReactDOM from "react-dom";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export default function Trip({ trip, lines, map, stops, addAlert, infoWindow }) {
    const [line, setLine] = useState();
    const [steps, setSteps] = useState();

    const [destination, setDestination] = useState();
    const [origin, setOrigin] = useState();

    const [element, setElement] = useState();

    useEffect(() => {
        fetchData(addAlert, s => setSteps(s.sort((a, b) => a.leg_id - b.leg_id || a.sequence - b.sequence)), getDirectionLegSteps, true, trip.direction_id);
        setLine(getLineFromData(trip.line_id, { lines }));
        setDestination(stops.find(s => s.id === trip.destination_id));
        setOrigin(stops.find(s => s.id === trip.origin_id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (steps && !element) {
            const snappedPath = [];
            steps.forEach((s, i) => {
                snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
                if (s.end_lat !== steps[i + 1]?.start_lat || s.end_lng !== steps[i + 1]?.start_lng) snappedPath.push(new window.google.maps.LatLng(s.start_lat, s.start_lng));
            });

            const element = new window.google.maps.Polyline({
                path: snappedPath,
                strokeColor: line ? "rgb(" + line.color + ")" : "#0000FF",
                strokeWeight: 5,
                strokeOpacity: .6,
                zIndex: 0,
                map
            });

            const distance = steps.map(a => a.distance).reduce((a, b) => a + b, 0);
            const duration = steps.map(a => a.duration).reduce((a, b) => a + b, 0);

            window.google.maps.event.addListener(element, "click", event => {
                infoWindow.close();

                const div = document.createElement("div");
                ReactDOM.render(<>
                    <div className="flex flex-wrap items-center">
                        {line && <LineBadge line={line} />}
                        <span className="ml-1">{origin?.name}</span>
                        <ArrowRightIcon className="w-6 mx-1 fill-gray-600" />
                        <span>{destination?.name}</span>
                    </div>

                    <dl className="text-sm grid lg:grid-cols-2 gap-x-6 gap-y-1 [&_dd]:font-medium px-2 mt-3">
                        <div className="flex items-center justify-between gap-2">
                            <dt>Distance</dt>
                            <dd>{Math.round(distance / 100) / 10} km</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Durée</dt>
                            <dd>{duration} s</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Nombre d'arrêts</dt>
                            <dd>{0}</dd>
                        </div>
                    </dl>
                </>, div);
                infoWindow.setContent(div);

                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
            });

            setElement(element);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps]);
}