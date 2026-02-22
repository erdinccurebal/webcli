export interface Request {
  action: string;
  tab: string;
  args: Record<string, unknown>;
  timeout?: number;
}

export interface Response {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export function encodeMessage(msg: Request | Response): string {
  return JSON.stringify(msg) + "\n";
}

export function decodeMessage<T = Request | Response>(line: string): T {
  return JSON.parse(line.trim()) as T;
}
