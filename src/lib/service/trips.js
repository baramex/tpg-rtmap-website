import { api } from ".";
import { getDateFromTime } from "../utils/date";

export function getCurrentTrips(bounds = 0) {
    return api(`/trips?timestamp=${Math.round(Date.now() / 1000)}&bounds=${bounds}`, "GET");
}

export function getTripStops(tripId) {
    return api(`/trip/${tripId}/stops`, "GET");
}

export function getCurrentPosition(tripStops) {
    const time = new Date();
    const stops = tripStops.sort((a, b) => a.sequence - b.sequence);

    const previous_stop = stops.slice(0, -2).findLast(stop => getDateFromTime(stop.departure_time) < time);
    const next_stop = stops.find(stop => getDateFromTime(stop.arrival_time) >= time);

    if (!previous_stop || !next_stop) return undefined;
    const progression = (time - getDateFromTime(previous_stop.departure_time)) / (getDateFromTime(next_stop.arrival_time) - getDateFromTime(previous_stop.departure_time));

    return {
        previous_stop: previous_stop,
        next_stop: next_stop,
        progression
    };
}