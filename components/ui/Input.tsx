import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] disabled:bg-gray-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input;
