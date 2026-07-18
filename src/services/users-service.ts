import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Register a new user.
 * Returns an object with either `{ success: true, data: "OK" }`
 * or `{ success: false, error: "email sudah terdaftar" }`.
 */
export async function registerUser(name: string, email: string, password: string) {
  if (name.length > 255 || email.length > 255 || password.length > 255) {
    return { success: false, error: "Input terlalu panjang. Maksimal 255 karakter." } as const;
  }

  if (name.length === 0 || email.length === 0 || password.length === 0) {
    return { success: false, error: "Input tidak boleh kosong." } as const;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Format email tidak valid." } as const;
  }

  // Check if email already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "email sudah terdaftar" } as const;
  }

  // Hash password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert new user
  await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .execute();

  return { success: true, data: "OK" } as const;
}

/**
 * Login a user by email and password.
 * Returns `{ success: true, data: "<uuid-token>" }` on success,
 * or `{ success: false, error: "Email atau passwored salah" }` on failure.
 */
export async function loginUser(email: string, password: string) {
  if (email.length > 255 || password.length > 255) {
    return { success: false, error: "Input terlalu panjang. Maksimal 255 karakter." } as const;
  }

  if (email.length === 0 || password.length === 0) {
    return { success: false, error: "Input tidak boleh kosong." } as const;
  }

  // 1. Query user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // 2. User not found
  if (!user) {
    return { success: false, error: "Email atau passwored salah" } as const;
  }

  // 3. Compare password with bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // 4. Password invalid
  if (!isPasswordValid) {
    return { success: false, error: "Email atau passwored salah" } as const;
  }

  // 5. Generate UUID token
  const token = crypto.randomUUID();

  // 6. Insert new session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 7. Return success with token
  return { success: true, data: token } as const;
}

/**
 * Get current user by session token.
 */
export async function getCurrentUser(token: string) {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    return { success: false, error: "Unauthorized" } as const;
  }

  return {
    success: true,
    data: {
      id: result.id,
      name: result.name,
      email: result.email,
      created_at: result.createdAt,
    },
  } as const;
}

/**
 * Logout user by deleting their session token.
 */
export async function logoutUser(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return { success: false, error: "Unauthorized" } as const;
  }

  await db
    .delete(sessions)
    .where(eq(sessions.token, token))
    .execute();

  return { success: true, data: "Logout success" } as const;
}


