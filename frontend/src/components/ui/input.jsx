import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[15px] text-white placeholder:text-white/45 outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

