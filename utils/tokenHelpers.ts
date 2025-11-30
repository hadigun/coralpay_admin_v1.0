const b64urlToString = (b64url: string) => {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const decoded =
    typeof window === "undefined"
      ? Buffer.from(b64, "base64").toString("utf-8")
      : atob(b64);
  return decoded;
};

export const getTokenExpiry = (jwt?: string | null): number | null => {
  if (!jwt) return null;
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    const json = JSON.parse(b64urlToString(payload));
    if (!json?.exp) return null;
    return Number(json.exp) * 1000; // ms
  } catch {
    return null;
  }
};
