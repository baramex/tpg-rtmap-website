import GoogleMapReact from 'google-map-react';
import { fetchData } from '../../lib/service';
import { useEffect, useState } from 'react';
import { getStops } from '../../lib/service/stops';
import { StopMarker } from './Marker';

export default function Map({ addAlert, showStops = true }) {
    const [stops, setStops] = useState();

    useEffect(() => {
        fetchData(addAlert, setStops, getStops);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyCNeFDat_XR0e2ArKsisG8M_JdgVYy9vfI" }}
            defaultCenter={{ lat: 46.20483, lng: 6.1430388 }}
            defaultZoom={12}
        >
            {stops && showStops && stops.map(s => <StopMarker lat={s.latitude} lng={s.longitude} key={s.id} stop={s} />)}
        </GoogleMapReact>
    );
}