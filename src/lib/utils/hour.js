export function fromValueToTime(value) {
    const hours = Math.floor(value / 60);
    const minutes = Math.floor(value % 60);
    const seconds = Math.floor((value % 1) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getValueFromDate(date) {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60; // TODO: use tz (zurich)
}