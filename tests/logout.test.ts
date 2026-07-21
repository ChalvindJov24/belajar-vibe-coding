import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/app";
import { cleanDatabase } from "./setup";

describe("DELETE /api/users/logout — Logout User", () => {
  let validToken: string;

  beforeAll(async () => {
    await cleanDatabase();

    // Register a user
    await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Logout User",
          email: "logout@example.com",
          password: "password123",
        }),
      })
    );

    // Login to get a valid token
    const loginRes = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "logout@example.com",
          password: "password123",
        }),
      })
    );
    const loginBody: any = await loginRes.json();
    validToken = loginBody.data;
  });

  it("should successfully logout with a valid token", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
      })
    );
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body).toEqual({ data: "Logout success" });
  });

  it("should not allow the same token to access /api/users/current after logout", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
      })
    );
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 401 if token is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token-xyz",
        },
      })
    );
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 401 if Authorization header is not Bearer format", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${validToken}`,
        },
      })
    );
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });
});