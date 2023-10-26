import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export default function Tooltip({ children, className, ...props }) {
    return <>
        <div className={clsx("group relative", className)} {...props}>
            <QuestionMarkCircleIcon className='w-[1.4rem] text-gray-400 inline' />
            <div role="tooltip" className="w-max max-w-xs top-full left-full -translate-x-full absolute invisible z-10 py-2 px-3 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-md opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100">
                {children}
                <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
        </div>
    </>;
}