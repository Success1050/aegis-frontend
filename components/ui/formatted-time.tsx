import * as React from "react";
import { formatWAT } from "@/lib/utils";

export interface FormattedWATProps extends React.HTMLAttributes<HTMLSpanElement> {
  date?: string | Date | null;
  showUtcTooltip?: boolean;
}

export function FormattedWAT({
  date,
  showUtcTooltip = true,
  className,
  ...props
}: FormattedWATProps) {
  if (!date) return <span className={className}>—</span>;

  const d = new Date(date);
  if (isNaN(d.getTime())) return <span className={className}>—</span>;

  const watString = formatWAT(d);
  const utcString = d.toISOString().replace("T", " ").substring(0, 19) + " UTC";

  return (
    <span
      className={className}
      title={showUtcTooltip ? `Equivalent to: ${utcString}` : undefined}
      {...props}
    >
      {watString}
    </span>
  );
}
