import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import submitButtonCss from "./SubmitButton.css?url";

export default function SubmitButton({ children, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" {...props}>
      <link rel="stylesheet" href={submitButtonCss} precedence="default" />
      {pending && <span className="spinner" />}
      {children}
    </button>
  );
}
