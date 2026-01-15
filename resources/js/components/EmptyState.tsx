import { LucideIcon, FileText } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: ReactNode;
    compact?: boolean;
}

export default function EmptyState({ 
    icon: Icon = FileText, 
    title,
    description, 
    action,
    compact = false
}: EmptyStateProps) {
    return (
        <div className={`
            flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-center dark:border-neutral-800 dark:bg-neutral-900/50
            ${compact ? 'py-10 px-4' : 'py-24 px-6'}
        `}>
            <div className={`
                rounded-full bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700
                ${compact ? 'mb-3 p-3' : 'mb-4 p-4'}
            `}>
                <Icon className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-neutral-400`} />
            </div>

            <h3 className="text-base font-semibold text-neutral-900 dark:text-white sm:text-lg">
                {title}
            </h3>

            {description && (
                <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
                    {description}
                </p>
            )}

            {action && (
                <div className={compact ? 'mt-4' : 'mt-6'}>
                    {action}
                </div>
            )}
        </div>
    );
}
