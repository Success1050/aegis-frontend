import * as React from "react";
import { maskPhone } from "@/lib/utils";

export interface MaskedPhoneProps extends React.HTMLAttributes<HTMLSpanElement> {
  phone?: string | null;
  canReveal?: boolean;
}

export function MaskedPhone({
  phone,
  canReveal = false,
  className,
  ...props
}: MaskedPhoneProps) {
  const [revealed, setRevealed] = React.useState(false);

  if (!phone) return <span className={className}>—</span>;

  const masked = maskPhone(phone);

  if (!canReveal) {
    return (
      <span className={className} title="NDPR Privacy Protected" {...props}>
        {masked}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 cursor-pointer select-none font-mono ${className}`}
      onClick={() => setRevealed(!revealed)}
      title={revealed ? "Click to mask" : "Click to reveal full number"}
      {...props}
    >
      {revealed ? phone : masked}
    </span>
  );
}
