import * as React from "react";
import { cn } from "../../utils";
import { X } from "lucide-react";

interface ToastProps {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
    onDismiss: (id: string) => void;
}

const Toast = ({ id, title, description, variant = "default", onDismiss }: ToastProps) => {
    const variantStyles = {
        default: "bg-white border-zinc-200 text-zinc-950 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900 dark:text-green-50 dark:border-green-900"
    };

    return (
        <div className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
            variantStyles[variant]
        )}>
            <div className="grid gap-1">
                {title && <div className="text-sm font-semibold">{title}</div>}
                {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

interface ToastContextType {
    toast: (props: Omit<ToastProps, "id" | "onDismiss">) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = React.useState<Omit<ToastProps, "onDismiss">[]>([]);

    const toast = React.useCallback(({ title, description, variant }: Omit<ToastProps, "id" | "onDismiss">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
