export function formatDepartureTime(dateInput) {
  if (!dateInput) return "TBD";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeString = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today, ${timeString}`;
  } else if (isTomorrow) {
    return `Tomorrow, ${timeString}`;
  } else {
    const datePart = date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
    return `${datePart}, ${timeString}`;
  }
}

export function toDateTimeLocalString(date = new Date(Date.now() + 60 * 60 * 1000)) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
