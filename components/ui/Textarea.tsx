import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] disabled:bg-gray-50 resize-y",
        className
      )}
      rows={4}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export default Textarea;
