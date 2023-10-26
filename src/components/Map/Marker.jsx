import clsx from 'clsx';
import stopIcon from '../../images/stop.png';

function Marker({ children, $hover, title }) {
    return (<div>
        <div className={clsx("transition", $hover ? "scale-110" : "scale-100")}>
            {children}
        </div>
        <div className={clsx("bg-white opacity-95 border -translate-x-1/2 absolute z-50 top-4 border-gray-300 rounded-md p-4", $hover ? "" : "hidden")}>
            <strong>{title}</strong>
        </div>
    </div>);

}

export function StopMarker({ stop, ...props }) {
    return (<Marker title={stop.name} {...props}>
        <img className='w-6 -translate-x-1/2 -translate-y-1/2' alt='arrêt' src={stopIcon} />
    </Marker>);
}