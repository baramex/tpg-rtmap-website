import { useEffect, useState } from "react";
import { fetchData } from "../../lib/service";
import { getCurrentPosition, getCurrentProgress, getTripStops } from "../../lib/service/trips";
import { getDirectionLegSteps, getDirectionLegs } from "../../lib/service/direction";
import { getLineFromData } from "../../lib/service/lines";
import { busIcon } from "../Icon";
import * as ReactDOM from "react-dom";
import { LineBadge } from "../Line/Line";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { getDateFromTime } from "../../lib/utils/date";
import { getDistanceBetween } from "../../lib/utils/position";

export default function Bus({ trip, map, lines, AdvancedMarkerElement, stops, infoWindow, addAlert }) {
    const [line, setLine] = useState();
    const [tripStops, setTripStops] = useState();
    const [legs, setLegs] = useState();
    const [steps, setSteps] = useState();

    const [destination, setDestination] = useState();

    const [deltaTime, setDeltaTime] = useState();
    const [previousPosition, setPreviousPosition] = useState();
    const [position, setPosition] = useState();
    const [progess, setProgress] = useState();

    const [element, setElement] = useState();

    const [infos] = useState({});

    useEffect(() => {
        fetchData(addAlert, setTripStops, getTripStops, true, trip.id);
        fetchData(addAlert, l => setLegs(l.sort((a, b) => a.sequence - b.sequence)), getDirectionLegs, true, trip.direction_id);
        fetchData(addAlert, s => setSteps(s.sort((a, b) => a.leg_id - b.leg_id || a.sequence - b.sequence)), getDirectionLegSteps, true, trip.direction_id);

        setLine(getLineFromData(trip.line_id, { lines }));
        setDestination(stops.find(s => s.id === trip.destination_id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (position) {
            if (!element) {
                const pin = new DOMParser().parseFromString(busIcon.replace("{color}", line ? "rgb(" + line.color + ")" : "#0000FF"), "image/svg+xml").documentElement;

                const element = new AdvancedMarkerElement({
                    content: pin,
                    title: line.name,
                    map,
                    position,
                    zIndex: 50
                });

                element.addListener("click", () => {
                    infoWindow.close();

                    const div = document.createElement("div");
                    ReactDOM.render(<>
                        <div className="flex items-center">
                            {line && <LineBadge line={line} />}
                            <ArrowRightIcon className="w-6 mx-1 fill-gray-600" />
                            <span>{destination?.name}</span>
                        </div>

                        <dl className="text-sm grid lg:grid-cols-2 gap-x-6 gap-y-1 [&_dd]:font-medium px-2 mt-3">
                            <div className="flex items-center justify-between gap-2">
                                <dt>Prochain arrêt</dt>
                                <dd>{stops.find(a => a.id === infos.progess?.next_stop?.stop_id)?.name}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt>Dans</dt>
                                <dd>{Math.round((getDateFromTime(infos.progess?.next_stop?.arrival_time)?.getTime() - Date.now()) / 1000)} secondes</dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt>Vitesse</dt>
                                <dd>{infos.previousPosition && infos.deltaTime && infos.position ? Math.round(getDistanceBetween(infos.previousPosition, infos.position) / (infos.deltaTime / 1000) * 3.6) : 0} km/h</dd>
                            </div>
                        </dl>
                    </>, div);
                    infoWindow.setContent(div);

                    infoWindow.open(element.map, element);
                });
                setElement(element);
            }
            else {
                element.position = position;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    useEffect(() => {
        infos.position = position;
        infos.previousPosition = previousPosition;
        infos.deltaTime = deltaTime;
        infos.progess = progess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, previousPosition, deltaTime, progess]);

    useEffect(() => {
        if (tripStops && legs && steps) {
            let previousTime = Date.now();
            let ppos;
            const int = setInterval(() => {
                let pro = getCurrentProgress(tripStops);
                let p = getCurrentPosition(legs, steps, pro);
                if (p && p.lat && p.lng) {
                    setPreviousPosition(ppos);
                    setPosition(p);
                    setProgress(pro);
                    setDeltaTime(Date.now() - previousTime);
                    previousTime = Date.now();
                    ppos = p;
                }
                else console.warn("No bus position found for trip " + trip.id);
            }, 1000);

            return () => clearInterval(int);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripStops, legs, steps]);
}