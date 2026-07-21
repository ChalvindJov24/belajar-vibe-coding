import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/app";
import { cleanDatabase } from "./setup";

describe("POST /api/users/login — Login User", () => {
  beforeAll(async () => {
    await cleanDatabase();

    // Register a user first
    await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "mypassword",
        }),
      })
    );
  });

  it("should successfully login with correct credentials and return a token", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "jane@example.com",
          password: "mypassword",
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("data");
    expect(typeof body.data).toBe("string");
  });

  it("should fail if email is not registered", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "mypassword",
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: "Email atau passwored salah" });
  });

  it("should fail if password is wrong", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "jane@example.com",
          password: "wrongpassword",
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: "Email atau passwored salah" });
  });

  it("should fail if email is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "", password: "mypassword" }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("should fail if password is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "jane@example.com", password: "" }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("should fail if email or password field is missing from body", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "jane@example.com" }),
      })
    );
    expect(res.status).toBe(422);
  });
});