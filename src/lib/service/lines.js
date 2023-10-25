import { api, getFromDataOrInsert } from ".";

export function getLines() {
    return api("/lines", "GET");
}

export function extractLineFromData(addAlert, id, data, setData, softRej) {
    return getFromDataOrInsert(addAlert, "lines", id, data, getLines, setData, softRej);
}

export function getLineFromData(id, data) {
    return data.lines?.find(line => line.id === id);
}