import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export function AlertError({ border, ...props }) {
    return (
        <Alert Icon={XCircleIcon} bgColor="bg-red-50" crossStyle="text-red-500 hover:bg-red-100" iconStyle="text-red-400" textColor="text-red-700" border={border ? "border-red-400" : ""} titleColor={props.list ? "text-red-800" : "text-red-700"} {...props} />
    );
}

export function AlertWarning({ border, ...props }) {
    return (
        <Alert Icon={ExclamationTriangleIcon} bgColor="bg-yellow-50" crossStyle="text-yellow-500 hover:bg-yellow-100" iconStyle="text-yellow-400" textColor="text-yellow-700" border={border ? "border-yellow-400" : ""} titleColor={props.list ? "text-yellow-800" : "text-yellow-700"} {...props} />
    );
}

export function AlertSuccess({ border, ...props }) {
    return (
        <Alert Icon={CheckCircleIcon} bgColor="bg-green-50" crossStyle="text-green-500 hover:bg-green-100" iconStyle="text-green-400" textColor="text-green-700" border={border ? "border-green-400" : ""} titleColor={props.list ? "text-green-800" : "text-green-700"} {...props} />
    );
}

export function Alert({ title, list, className, bgColor, iconStyle, titleColor, textColor, Icon, crossStyle, border, canClose = true, onClose, ephemeral, ...props }) {
    return (
        <div className={clsx("p-4 animate-slide-in pointer-events-auto", className, bgColor, border ? "rounded-r-md border-l-2" : ephemeral ? "rounded-full md:mx-auto md:w-3/12 md:min-w-[24rem]" : "rounded-md", border)} onAnimationEnd={ephemeral ? a => { if (a.animationName === "slide-in") { a.target.classList.remove("animate-slide-in"); a.target.classList.add("animate-delayed-fade-out"); } if (a.animationName === "fade-out") { onClose(); }; } : null} {...props}>
            <div className={clsx("flex", list ? "" : "items-center")}>
                <div className="flex-shrink-0">
                    <Icon className={clsx("h-5 w-5", iconStyle)} aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <p className={clsx("text-sm font-medium", titleColor)}>{title}</p>
                    {list &&
                        <div className={clsx("mt-2 text-sm", textColor)}>
                            <ul className="list-disc space-y-1 pl-5">
                                {list.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    }
                </div>
                {canClose && onClose &&
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                className={clsx("inline-flex rounded-md p-1 focus:outline-none", crossStyle)}
                                {...(onClose && { onClick: onClose })}
                            >
                                <span className="sr-only">Fermer</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export function AlertContainer({ alerts, setAlerts }) {
    return (
        <div className="w-[calc(100%-4rem)] flex flex-col gap-5 fixed top-0 left-0 m-8 z-50 pointer-events-none">
            {
                alerts.map(alert => {
                    const opt = {
                        title: alert.title,
                        list: alert.list,
                        className: clsx(alert.className, "shadow-md", !alert.ephemeral && "w-full"),
                        ephemeral: !!alert.ephemeral,
                        border: !alert.ephemeral,
                        onClose: () => setAlerts(a => {
                            const i = a.findIndex(b => b.id === alert.id);
                            if (i === -1) return a;
                            a.splice(i, 1);
                            return [...a];
                        }),
                        key: alert.id
                    };
                    return (alert.type === "error" ?
                        <AlertError {...opt} /> :
                        alert.type === "warning" ?
                            <AlertWarning {...opt} /> :
                            alert.type === "success" ?
                                <AlertSuccess {...opt} /> :
                                null)
                })
            }
        </div>
    )
}