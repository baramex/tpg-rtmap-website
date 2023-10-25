import { useEffect, useState } from "react";
import { getCurrentTrips } from "../../lib/service/trips";
import { dataSetter, fetchData } from "../../lib/service";
import { TripRow } from "./Trip";
import { getStops } from "../../lib/service/stops";
import { getLines } from "../../lib/service/lines";

export default function TripList({ addAlert, data, setData }) {
    const [trips, setTrips] = useState();
    const [stops_fetched, setStopsFetched] = useState(false);
    const [lines_fetched, setLinesFetched] = useState(false);

    useEffect(() => {
        fetchData(addAlert, dataSetter(setData, "stops"), getStops).then(() => setStopsFetched(true));
        fetchData(addAlert, dataSetter(setData, "lines"), getLines).then(() => setLinesFetched(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!trips && stops_fetched && lines_fetched) fetchData(addAlert, trips => setTrips(trips?.sort((a,b) => a.line_id - b.line_id)), getCurrentTrips);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stops_fetched, lines_fetched]);

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
            {trips && trips.map(trip => <TripRow key={trip.id} trip={trip} addAlert={addAlert} data={data} setData={setData} />)}
        </tbody>
    </table>);
}