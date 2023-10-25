import clsx from "clsx";

export function ProgressBar({ value, className, ...props }) {
    return (<div className={clsx("rounded-full relative bg-gray-200 w-full h-1", className)} {...props}>
        <div className="rounded-full bg-red-400 absolute h-full" style={{width: value + "%"}}></div>
        <div className="h-3 w-3 rounded-full bg-gray-200 absolute -translate-y-1/2 top-1/2 -translate-x-1/2 border-[3px] border-red-400"></div>
        <div className="h-3 w-3 rounded-full bg-gray-200 absolute -translate-y-1/2 top-1/2 left-full -translate-x-1/2 border-[3px] border-gray-200"></div>
        <div style={{left: value + "%"}} className="h-3 w-3 rounded-full bg-gray-200 absolute -translate-y-1/2 top-1/2 -translate-x-1/2 border-[3px] border-red-400"></div>
    </div>);
}