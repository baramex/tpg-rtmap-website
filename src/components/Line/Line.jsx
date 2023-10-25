import clsx from "clsx"

export function LineBadge({ line, className, ...props }) {
    return (<span className={clsx("flex justify-center items-center px-2.5 py-px rounded-full", className)} style={{ backgroundColor: `rgb(${line.color})` }} {...props}>
        <span className={clsx("font-semibold text-sm", line.color_type === "Dark" ? "text-black" : "text-white")}>{line.name}</span>
    </span>);
}