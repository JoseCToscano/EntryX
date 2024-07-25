import * as React from "react";

import { cn } from "~/lib/utils";
import type {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  required?: boolean;
  register?: UseFormRegister<FieldValues>;
  registerOptions?: Partial<RegisterOptions<FieldValues, string>>;
  errors?: FieldErrors;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    id,
    errors,
    registerOptions,
    required,
    register,
    ...props
  }) => {
    return (
      <textarea
        id={id}
        {...(register ? register(id, { required, ...registerOptions }) : {})}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          errors && errors[id] && "border-rose-500",
          errors && errors[id] && "focus:border-rose-500",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
