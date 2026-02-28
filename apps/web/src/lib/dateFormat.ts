export function formatUSDate(isoDate: string) {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return isoDate;
  }
}
