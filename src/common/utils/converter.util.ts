export function convertMilisToString(ms: number): string {
  const date = new Date(ms);
  let hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  hours === "00" ? (hours = "") : (hours += ":");
  return `${hours}${minutes}:${seconds}`;
} // ? Should probably handle days as well
