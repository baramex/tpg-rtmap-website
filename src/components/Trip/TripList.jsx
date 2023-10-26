import { useEffect, useState } from "react";
import { getCurrentTrips } from "../../lib/service/trips";
import { dataSetter, fetchData } from "../../lib/service";
import { TripRow } from "./Trip";
import { getStops } from "../../lib/service/stops";
import { getLines } from "../../lib/service/lines";
import { getDateFromTime } from "../../lib/utils/date";
import { scheduleJob } from "node-schedule";

export default function TripList({ addAlert, data, setData }) {
    const [trips, setTrips] = useState();
    const [stopsFetched, setStopsFetched] = useState(false);
    const [linesFetched, setLinesFetched] = useState(false);

    const [lastDate, setLastDate] = useState();

    useEffect(() => {
        fetchData(addAlert, dataSetter(setData, "stops"), getStops).then(() => setStopsFetched(true));
        fetchData(addAlert, dataSetter(setData, "lines"), getLines).then(() => setLinesFetched(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!trips && stopsFetched && linesFetched) {
            const date = Math.round(Date.now() / 1000);

            const interval = setInterval(() => {
                console.log("[top] Update new trips"); // TODO: test
                fetchData(addAlert, trips => { setLastDate(date); setTrips(t => trips.filter(a => !t.some(b => a.id === b.id)).concat(t).map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() >= Date.now() })).sort((a, b) => a.line_id - b.line_id)); }, getCurrentTrips, true, 10, date, lastDate);
            }, 1000 * 60 * 2);

            fetchData(addAlert, trips => { setLastDate(date); setTrips(trips.map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() >= Date.now() })).sort((a, b) => a.line_id - b.line_id)); }, getCurrentTrips, true, 2, date);

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stopsFetched, linesFetched]);

    useEffect(() => {
        if (trips) {
            const job = scheduleJob("0 * * * * *", () => {
                console.log("[top] Update show trips");
                setTrips(t => t.map(trip => ({ ...trip, show: getDateFromTime(trip.departure_time).getTime() <= Date.now() && getDateFromTime(trip.arrival_time).getTime() > Date.now() })));
            });

            return () => job.cancel();
        }
    }, [trips]);

    return (<table>
        <thead>
            <tr>
                <th>Ligne</th>
                <th></th>
                <th>Destination</th>
                <th className="px-2">Heure de départ</th>
                <th className="px-2">Heure d'arrivée</th>
                <th>Précedent arrêt</th>
                <th>Prochain arrêt</th>
            </tr>
        </thead>
        <tbody>
            {trips && trips.filter(t => t.show).map(trip => <TripRow key={trip.id} trip={trip} addAlert={addAlert} data={data} setData={setData} />)}
        </tbody>
    </table>);
}