export function isValidJson(str: string) {
  try {
    const parsedJson = JSON.parse(str);

    if (parsedJson && typeof parsedJson === "object") {
      return true;
    }
  } catch (err) {
    return false; // Expected if JSON.parse fails
  }
  return false;
}
