import { useEffect, useState } from "react";

export function HourDisplay(props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentDate(new Date()), 1000);

        return () => clearInterval(interval);
    }, []);

    return <span {...props}>{currentDate.toLocaleTimeString("fr-CH")}</span>;
}