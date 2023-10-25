import { api, getFromDataOrInsert } from ".";

export function getStops() {
    return api("/stops", "GET");
}

export function extractStopFromData(addAlert, id, data, setData, softRej) {
    return getFromDataOrInsert(addAlert, "stops", id, data, getStops, setData, softRej);
}

export function getStopFromData(id, data) {
    return data.stops?.find(stop => stop.id === id);
}