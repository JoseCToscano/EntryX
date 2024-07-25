import * as React from "react";

import { cn } from "~/lib/utils";
import type {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  required?: boolean;
  register?: UseFormRegister<FieldValues>;
  registerOptions?: Partial<RegisterOptions<FieldValues, string>>;
  errors?: FieldErrors;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      id,
      errors,
      registerOptions,
      required,
      register,
      ...props
    },
    ref,
  ) => {
    return (
      <input
        id={id}
        {...(register ? register(id, { required, ...registerOptions }) : {})}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          errors && errors[id] && "border-rose-500",
          errors && errors[id] && "focus:border-rose-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
