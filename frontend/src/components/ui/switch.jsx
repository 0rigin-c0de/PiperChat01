import * as React from "react";

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    ref={ref}
    onClick={() => onCheckedChange?.(!checked)}
    className={`
      inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
      transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
      focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50
      ${checked ? "bg-green-500" : "bg-white/20"}
      ${className || ""}
    `}
    {...props}
  >
    <span
      className={`
        pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0
        transition-transform ${checked ? "translate-x-4" : "translate-x-0"}
      `}
    />
  </button>
));
Switch.displayName = "Switch";

export { Switch };