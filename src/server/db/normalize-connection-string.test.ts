import { normalizePgConnectionString } from "./normalize-connection-string";

describe("normalizePgConnectionString", () => {
  it("leaves connection strings without sslmode unchanged", () => {
    const input = "postgresql://user:pass@example.com:5432/app";

    expect(normalizePgConnectionString(input)).toBe(input);
  });

  it("forces sslmode=verify-full for deprecated alias modes", () => {
    const input =
      "postgresql://user:pass@example.com:5432/app?sslmode=require&channel_binding=require";

    expect(normalizePgConnectionString(input)).toBe(
      "postgresql://user:pass@example.com:5432/app?sslmode=verify-full&channel_binding=require",
    );
  });

  it("normalizes alias modes in subsequent query params", () => {
    const input =
      "postgresql://user:pass@example.com:5432/app?connect_timeout=5&sslmode=prefer";

    expect(normalizePgConnectionString(input)).toBe(
      "postgresql://user:pass@example.com:5432/app?connect_timeout=5&sslmode=verify-full",
    );
  });
});
