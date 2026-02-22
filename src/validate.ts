export function requireString(
  args: Record<string, unknown>,
  key: string,
  label?: string,
): string {
  const val = args[key];
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new Error(`Missing required argument: ${label || key}`);
  }
  return val;
}

export function optionalString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const val = args[key];
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "string")
    throw new Error(`Invalid argument: ${key} must be a string`);
  return val;
}

export function optionalNumber(
  args: Record<string, unknown>,
  key: string,
): number | undefined {
  const val = args[key];
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "number")
    throw new Error(`Invalid argument: ${key} must be a number`);
  return val;
}

export function requireUrl(
  args: Record<string, unknown>,
  key: string,
): string {
  const url = requireString(args, key, "URL");
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}
