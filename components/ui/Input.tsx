import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => (
    <input
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid var(--surface-border)",
        color: "var(--fg1)",
        borderRadius: "8px",
        ...style,
      }}
      className={cn(
        "w-full px-3 py-2 text-sm focus:outline-none disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input;
