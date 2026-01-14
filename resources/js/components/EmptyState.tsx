import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    action 
}: EmptyStateProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                <Icon className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
                {description}
            </p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}