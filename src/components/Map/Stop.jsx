import { useEffect, useState } from "react";
import { stopIcon } from "../Icon";

export default function Stop({ stop, AdvancedMarkerElement, map, infoWindow }) {
    const [element, setElement] = useState();

    useEffect(() => {
        if (!element) {
            const pin = new DOMParser().parseFromString(stopIcon, "image/svg+xml").documentElement;

            const marker = new AdvancedMarkerElement({
                position: { lat: stop.latitude, lng: stop.longitude },
                map,
                title: stop.name,
                content: pin
            });

            marker.addListener("click", () => {
                infoWindow.close();
                infoWindow.setContent(marker.title);
                infoWindow.open(marker.map, marker);
            });
            setElement(marker);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}