import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-xl bg-slate-200",
        className,
      )}
    />
  );
}
