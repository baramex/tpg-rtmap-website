import { api } from ".";
import { getDateFromTime } from "../utils/date";

export function getCurrentTrips(bounds = 0, date, from) {
    return api(`/trips?timestamp=${Math.round(date || Date.now() / 1000)}&bounds=${bounds}${from ? "&from=" + from : ""}`, "GET");
}

export function getTripStops(tripId) {
    return api(`/trip/${tripId}/stops`, "GET");
}

export function getTripShape(tripId) {
    return api(`/trip/${tripId}/shape`, "GET");
}

export function getCurrentPosition(tripStops) {
    const time = new Date();
    const stops = tripStops.sort((a, b) => a.sequence - b.sequence);

    const previous_stop = stops.slice(0, -2).findLast(stop => getDateFromTime(stop.arrival_time).getTime() < time.getTime());
    const next_stop = stops.find(stop => getDateFromTime(stop.arrival_time).getTime() >= time.getTime());

    if (!previous_stop || !next_stop) return undefined;
    const progression = Math.max(Math.min((time.getTime() - getDateFromTime(previous_stop.departure_time).getTime()) / (getDateFromTime(next_stop.arrival_time).getTime() - getDateFromTime(previous_stop.departure_time).getTime()), 1), 0);

    return {
        previous_stop: previous_stop,
        next_stop: next_stop,
        progression
    };
}