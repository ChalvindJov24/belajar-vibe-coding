import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

/**
 * Clean all data from users and sessions tables before each test.
 * Delete sessions first due to foreign key constraint, then users.
 */
export async function cleanDatabase() {
  await db.delete(sessions);
  await db.delete(users);
}
