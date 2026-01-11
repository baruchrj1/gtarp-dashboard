'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

/**
 * Button component with loading state
 * Shows spinner and optional loading text when loading
 * 
 * @example
 * <LoadingButton 
 *   loading={isSubmitting} 
 *   loadingText="Salvando..."
 *   onClick={handleSubmit}
 * >
 *   Salvar
 * </LoadingButton>
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, disabled, className = '', ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={loading || disabled}
                className={`gta-btn ${className}`}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading && loadingText ? loadingText : children}
            </button>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';
