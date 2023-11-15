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

export function getCurrentProgress(tripStops) {
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

export function getCurrentPosition(directionLegs, legSteps, progress) {
    if (!progress) return undefined;
    const leg = directionLegs.find(l => l.origin_id === progress.previous_stop.stop_id && l.destination_id === progress.next_stop.stop_id);
    if (!leg) return undefined;

    const steps = legSteps.filter(s => s.leg_id === leg.id).sort((a, b) => a.sequence - b.sequence);

    let currProgress = 0;
    for (const index in steps) {
        const step = steps[index];
        const endProgress = currProgress + step.duration / leg.duration;

        if ((progress.progression >= currProgress && progress.progression <= endProgress) || index === steps.length - 1) {
            const startPos = { lat: step.start_lat, lng: step.start_lng };
            const endPos = { lat: step.end_lat, lng: step.end_lng };

            const lat = (progress.progression - currProgress) * (endPos.lat - startPos.lat) / (endProgress - currProgress) + startPos.lat;
            const lng = (progress.progression - currProgress) * (endPos.lng - startPos.lng) / (endProgress - currProgress) + startPos.lng;

            return { lat, lng };
        }

        currProgress += step.duration / leg.duration;
    }
}