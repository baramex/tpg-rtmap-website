import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { LineBadge } from "../Line/Line";
import { useEffect, useRef, useState } from "react";
import { getStopFromData } from "../../lib/service/stops";
import { getLineFromData } from "../../lib/service/lines";
import { fetchData } from "../../lib/service";
import { getCurrentPosition, getTripStops } from "../../lib/service/trips";
import { ProgressBar } from "../Misc/Progress";
import { scheduleJob } from "node-schedule";
import useOnScreen from "../../lib/hooks/useOnScreen";
import { getDateFromTime } from "../../lib/utils/date";
import Tooltip from "../Misc/Tooltip";

export function TripRow({ trip, data, addAlert }) {
    const [origin, setOrigin] = useState();
    const [destination, setDestination] = useState();
    const [stops, setStops] = useState();

    const [job, setJob] = useState();
    const [position, setPosition] = useState();

    const [line, setLine] = useState();

    const ref = useRef();
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (isVisible) {
            if (!origin) setOrigin(getStopFromData(trip.origin_id, data));
            if (!destination) setDestination(getStopFromData(trip.destination_id, data));

            if (!line) setLine(getLineFromData(trip.line_id, data));

            if (!stops) fetchData(addAlert, setStops, getTripStops, true, trip.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    useEffect(() => {
        if (stops && !job && isVisible) {
            setPosition(getCurrentPosition(stops));

            console.log(`[${trip.id}] Start job`);
            let j = scheduleJob("* * * * * *", () => {
                console.log(`[${trip.id}] Update position`);
                setPosition(getCurrentPosition(stops));
                if (getDateFromTime(trip.arrival_time).getTime() <= Date.now()) return j.cancel();
            });
            setJob(j);

            return () => (job || j).cancel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stops, isVisible]);

    useEffect(() => {
        if (job) {
            if (isVisible) {
                console.log(`[${trip.id}] Resume job`);
                job.reschedule("* * * * * *");
            }
            else {
                console.log(`[${trip.id}] Pause job`);
                job.cancel();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    return (<>
        <tr ref={ref}>
            <td className="py-3">{line && <LineBadge line={line} />}</td>
            <td className="py-3 mx-1"><ArrowRightIcon className="w-6 fill-gray-600" /></td>
            <td className="py-3">{destination?.name}</td>
            <td className="py-3 text-center">{trip.departure_time}</td>
            <td className="py-3 text-center">{trip.arrival_time}</td>
            <td className="py-3 px-2">{position && getStopFromData(position.previous_stop.stop_id, data)?.name}</td>
            <td className="py-3 px-2 text-right">{position && getStopFromData(position.next_stop.stop_id, data)?.name}</td>
            <td className="py-3 ps-5">
                <Tooltip>
                    <dl className="text-sm grid lg:grid-cols-2 gap-x-6 gap-y-4 [&_dd]:font-medium px-2">
                        <div className="flex items-center justify-between gap-2">
                            <dt>ID de trajet</dt>
                            <dd>{trip.id}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Type de transport</dt>
                            <dd>{trip.transport_mode}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Heure de départ</dt>
                            <dd>{trip.departure_time}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Heure d'arrivée</dt>
                            <dd>{trip.arrival_time}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Origine</dt>
                            <dd>{origin?.name}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Destination</dt>
                            <dd>{destination?.name}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Direction</dt>
                            <dd>{trip.direction}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <dt>Nombre d'arrêts</dt>
                            <dd>{stops?.length}</dd>
                        </div>
                    </dl>
                </Tooltip>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colSpan={2}>
                <ProgressBar value={(position?.progression || 0) * 100} />
                <div className="flex justify-between mt-1">
                    <span>{position?.previous_stop.departure_time}</span>
                    <span>{position?.next_stop.arrival_time}</span>
                </div>
            </td>
        </tr>
    </>);
}