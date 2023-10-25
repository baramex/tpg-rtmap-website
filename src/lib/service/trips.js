import { api } from ".";
import { getValueFromDate } from "../utils/hour";

export function getCurrentTrips(bounds = 0) {
    return api(`/trips?timestamp=${Math.round(Date.now() / 1000)}&bounds=${bounds}`, "GET");
}

export function getTripStops(tripId) {
    return api(`/trip/${tripId}/stops`, "GET");
}

export function getCurrentPosition(tripStops) {
    const hour = getValueFromDate(new Date());
    const stops = tripStops.sort((a, b) => a.sequence - b.sequence);

    const previous_stop = stops.slice(0, -2).findLast(stop => stop.departure_time < hour);
    const next_stop = stops.find(stop => stop.arrival_time >= hour);

    if (!previous_stop || !next_stop) return undefined;
    const progression = (hour - previous_stop.departure_time) / (next_stop.arrival_time - previous_stop.departure_time);

    return {
        previous_stop: previous_stop,
        next_stop: next_stop,
        progression
    };
}