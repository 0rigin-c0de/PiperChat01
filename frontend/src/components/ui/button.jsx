import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    default:
      "bg-gradient-to-br from-violet-500 to-cyan-400 text-zinc-950 hover:from-violet-400 hover:to-cyan-300",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
    danger:
      "bg-red-500/90 text-white hover:bg-red-500 border border-red-400/20",
  },
  sizes: {
    default: "h-11 px-5",
    sm: "h-9 px-4 rounded-lg",
    lg: "h-12 px-6 text-[15px]",
  },
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants.base,
          buttonVariants.variants[variant] || buttonVariants.variants.default,
          buttonVariants.sizes[size] || buttonVariants.sizes.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

