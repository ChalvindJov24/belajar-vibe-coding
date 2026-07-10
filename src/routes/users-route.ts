import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

/**
 * Router khusus endpoint registrasi user.
 * Endpoint: POST /api/users
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
  );
