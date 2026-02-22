import { describe, it, expect } from "vitest";
import { requireString, optionalString, optionalNumber, requireUrl } from "../src/validate.js";

describe("requireString", () => {
  it("returns a valid string", () => {
    expect(requireString({ name: "hello" }, "name")).toBe("hello");
  });

  it("throws on missing key", () => {
    expect(() => requireString({}, "name")).toThrow("Missing required argument: name");
  });

  it("throws on empty string", () => {
    expect(() => requireString({ name: "  " }, "name")).toThrow("Missing required argument");
  });

  it("throws on non-string", () => {
    expect(() => requireString({ name: 123 }, "name")).toThrow("Missing required argument");
  });

  it("uses custom label in error", () => {
    expect(() => requireString({}, "x", "my-field")).toThrow("Missing required argument: my-field");
  });
});

describe("optionalString", () => {
  it("returns string when present", () => {
    expect(optionalString({ k: "val" }, "k")).toBe("val");
  });

  it("returns undefined for missing key", () => {
    expect(optionalString({}, "k")).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(optionalString({ k: null }, "k")).toBeUndefined();
  });

  it("throws on non-string", () => {
    expect(() => optionalString({ k: 42 }, "k")).toThrow("must be a string");
  });
});

describe("optionalNumber", () => {
  it("returns number when present", () => {
    expect(optionalNumber({ k: 42 }, "k")).toBe(42);
  });

  it("returns undefined for missing key", () => {
    expect(optionalNumber({}, "k")).toBeUndefined();
  });

  it("throws on non-number", () => {
    expect(() => optionalNumber({ k: "42" }, "k")).toThrow("must be a number");
  });
});

describe("requireUrl", () => {
  it("returns URL as-is when it has protocol", () => {
    expect(requireUrl({ url: "https://example.com" }, "url")).toBe("https://example.com");
  });

  it("prepends https:// when protocol missing", () => {
    expect(requireUrl({ url: "example.com" }, "url")).toBe("https://example.com");
  });

  it("preserves http://", () => {
    expect(requireUrl({ url: "http://localhost:3000" }, "url")).toBe("http://localhost:3000");
  });

  it("throws on missing URL", () => {
    expect(() => requireUrl({}, "url")).toThrow("Missing required argument: URL");
  });
});
