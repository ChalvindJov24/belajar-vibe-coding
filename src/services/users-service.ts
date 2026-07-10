import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Register a new user.
 * Returns an object with either `{ success: true, data: "OK" }`
 * or `{ success: false, error: "email sudah terdaftar" }`.
 */
export async function registerUser(name: string, email: string, password: string) {
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
