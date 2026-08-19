"use client";

import { useRef, useState, useTransition } from "react";

export interface ActionResult {
  error?: string;
  success?: string;
}

interface ActionFormProps {
  action: (formData: FormData) => Promise<ActionResult | void>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  buttonClassName?: string;
  confirmMessage?: string;
  resetOnSuccess?: boolean;
}

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  className = "space-y-3",
  buttonClassName = "btn-primary",
  confirmMessage,
  resetOnSuccess = false
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setResult({});
    startTransition(async () => {
      const response = (await action(formData)) ?? {};
      setResult(response);
      if (!response.error && resetOnSuccess) formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className={className}>
      {children}

      {result.error ? (
        <p className="border-l-2 border-oxblood bg-oxblood/5 px-3 py-2 text-[13px] text-oxblood">
          {result.error}
        </p>
      ) : null}

      {result.success ? (
        <p className="border-l-2 border-navy bg-navy-50 px-3 py-2 text-[13px] text-navy">
          {result.success}
        </p>
      ) : null}

      <button type="submit" className={buttonClassName} disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
