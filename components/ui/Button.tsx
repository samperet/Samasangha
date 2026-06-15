"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { background: "#3a8db7", color: "#ffffff", boxShadow: "var(--shadow-sm)" },
  secondary: { background: "var(--lapis-700)", color: "var(--fg-on-dark)" },
  ghost:     { background: "transparent", color: "#3a8db7", border: "1px solid var(--surface-border)" },
  danger:    { background: "#dc2626", color: "#fff" },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        style={{ ...variantStyles[variant], ...style }}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          {
            "px-3 py-1.5 text-sm rounded-md": size === "sm",
            "px-4 py-2 text-sm rounded-lg": size === "md",
            "px-6 py-3 text-base rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
