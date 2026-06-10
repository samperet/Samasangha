import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, style, ...props }, ref) => (
    <textarea
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid var(--surface-border)",
        color: "var(--fg1)",
        borderRadius: "8px",
        ...style,
      }}
      className={cn(
        "w-full px-3 py-2 text-sm focus:outline-none resize-y disabled:opacity-60",
        className
      )}
      rows={4}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export default Textarea;
