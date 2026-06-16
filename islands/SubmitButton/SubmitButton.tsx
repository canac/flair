import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import "./SubmitButton.css";

export default function SubmitButton(
  { children, ...props }: JSX.HTMLAttributes<HTMLButtonElement>,
) {
  const ref = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) {
      return;
    }

    const onSubmit = () => setLoading(true);
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  return (
    <button ref={ref} type="submit" {...props}>
      {loading && <span class="spinner" />}
      {children}
    </button>
  );
}
