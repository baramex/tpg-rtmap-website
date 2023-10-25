export function getDateFromTime(time) {
    const date = new Date();
    time = new Date(time);
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(time.getSeconds());
    return date;
}