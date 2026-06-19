import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text-primary mb-1.5"
      >
        {label}
        {required && <span className="text-accent-rose ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputStyles =
  "w-full rounded-xl border border-border bg-bg-cream px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-rose focus:ring-1 focus:ring-accent-rose/30 transition-colors min-h-[44px] aria-invalid:border-red-400 aria-invalid:ring-red-200";
