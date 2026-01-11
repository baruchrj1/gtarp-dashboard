/**
 * Theme-aware Form Components
 * Provides consistent styling across light and dark modes
 */

import { forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

// Input component
export const ThemedInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all ${className}`}
                {...props}
            />
        );
    }
);

ThemedInput.displayName = 'ThemedInput';

// Select component
export const ThemedSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className = '', children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={`w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }
);

ThemedSelect.displayName = 'ThemedSelect';

// Textarea component
export const ThemedTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y ${className}`}
                {...props}
            />
        );
    }
);

ThemedTextarea.displayName = 'ThemedTextarea';

// Option component
export function ThemedOption({ children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
    return (
        <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" {...props}>
            {children}
        </option>
    );
}
