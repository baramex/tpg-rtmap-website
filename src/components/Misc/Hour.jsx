import { useEffect, useState } from "react";
import { fromValueToTime, getValueFromDate } from "../../lib/utils/hour";

export function HourDisplay(props) {
    const [currentHour, setCurrentHour] = useState(getValueFromDate(new Date()));

    useEffect(() => {
        const interval = setInterval(() => setCurrentHour(getValueFromDate(new Date())), 1000);

        return () => clearInterval(interval);
    }, []);

    return <span {...props}>{fromValueToTime(currentHour)} ({Math.round(currentHour * 100) / 100})</span>;
}