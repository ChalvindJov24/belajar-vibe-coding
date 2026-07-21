import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/app";
import { cleanDatabase } from "./setup";

describe("GET / — Health Check", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  it("should return 200 with server status", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("message");
  });
});