import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/app";
import { cleanDatabase } from "./setup";

describe("POST /api/users — Register User", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  const validUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "secret123",
  };

  it("should successfully register with valid data", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validUser),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: "OK" });
  });

  it("should fail if email is already registered", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validUser),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "email sudah terdaftar");
  });

  it("should fail if email format is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Doe",
          email: "invalid-email",
          password: "secret123",
        }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    // expect validation error for invalid email
    expect(body).toHaveProperty("error");
  });

  it("should fail if a required field is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: "test@example.com", password: "secret123" }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("should fail if a field exceeds 255 characters", async () => {
    const longStr = "a".repeat(256);
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: longStr,
          email: "test@example.com",
          password: "secret123",
        }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("should fail if request body is missing required fields", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "No Email" }),
      })
    );
    expect(res.status).toBe(422);
  });
});