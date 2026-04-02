import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

interface PageShellProps {
  children: React.ReactNode;
  /** Optional extra class names for the inner container */
  className?: string;
}

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className="min-h-screen bg-bs-page font-body">
      <div className={`mx-auto max-w-[860px] px-5 py-8 pb-16 ${className}`}>
        {children}
      </div>
    </div>
  );
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
