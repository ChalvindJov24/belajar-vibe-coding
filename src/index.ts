import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Welcome to Elysia + Drizzle + MySQL backend built with Bun!",
  }))
  .post(
    "/users",
    async ({ body }) => {
      const { name, email } = body;
      try {
        await db.insert(users).values({ name, email });
        return { success: true, message: `User ${name} created successfully!` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
