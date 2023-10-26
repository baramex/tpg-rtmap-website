import { scheduleJob } from "node-schedule";
import { useEffect, useState } from "react";

export function HourDisplay(props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const job = scheduleJob("* * * * * *", () => setCurrentDate(new Date()));

        return () => job.cancel();
    }, []);

    return <span {...props}>{currentDate.toLocaleTimeString("fr-CH")}</span>;
}