export function getDateFromTime(time) {
    const date = new Date();
    return new Date(date.toDateString() + " " + time);
}