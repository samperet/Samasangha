"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-[#c9a84c] hover:bg-[#b8973b] text-white focus:ring-[#c9a84c]":
              variant === "primary",
            "bg-[#1a2744] hover:bg-[#243560] text-white focus:ring-[#1a2744]":
              variant === "secondary",
            "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300":
              variant === "ghost",
            "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
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
