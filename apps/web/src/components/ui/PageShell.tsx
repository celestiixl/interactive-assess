import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bs-bg text-bs-text">{children}</div>;
}

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
