import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users-service";

/**
 * Router khusus endpoint registrasi dan login user.
 * Endpoint: POST /api/users
 * Endpoint: POST /api/users/login
 */
export const usersRoute = new Elysia()
  .post(
    "/api/users",
    async ({ body }) => {
      const { name, email, password } = body as {
        name: string;
        email: string;
        password: string;
      };

      const result = await registerUser(name, email, password);

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return { data: "OK" };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/api/users/login",
    async ({ body }) => {
      const { email, password } = body;

      const result = await loginUser(email, password);

      if (!result.success) {
        return { data: result.error };
      }

      return { data: result.data };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
