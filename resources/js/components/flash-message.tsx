import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashMessageData {
    message?: string;
    success?: string;
    error?: string;
}

export default function FlashMessage() {
    const { flash } = usePage<{ flash: FlashMessageData }>().props;
    const content = flash.error || flash.success || flash.message;

    // If there is no content, don't render the wrapper at all
    if (!content) return null;

    // We provide a 'key'. Whenever the message text changes, 
    // React will completely unmount and remount this internal component,
    // naturally resetting the 5-second timer.
    return <FlashMessageChild key={content} content={content} isError={!!flash.error} />;
}

function FlashMessageChild({ content, isError }: { content: string; isError: boolean }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []); // Only runs once on mount (when the message first appears)

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0 duration-300">
            <div className={`
                relative flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm
                ${isError 
                    ? 'border-red-200 bg-red-50/90 text-red-900 dark:border-red-900/50 dark:bg-red-900/90 dark:text-red-100' 
                    : 'border-green-200 bg-green-50/90 text-green-900 dark:border-green-900/50 dark:bg-green-900/90 dark:text-green-100'
                }
            `}>
                {isError ? (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                
                <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">
                        {content}
                    </p>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
}