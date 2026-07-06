import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:@localhost:3306/belajar_vibe_coding";

// Automatically ensure the database exists
try {
  const url = new URL(connectionString);
  const databaseName = url.pathname.substring(1);
  
  // Construct connection URL without specific database
  const connectionUrlWithoutDb = `${url.protocol}//${url.username}${url.password ? `:${url.password}` : ""}@${url.host}`;
  
  const adminConnection = await mysql.createConnection(connectionUrlWithoutDb);
  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
  await adminConnection.end();
} catch (error) {
  console.warn("Failed to check/create database automatically. Proceeding with direct connection...", error);
}

const connection = await mysql.createConnection(connectionString);
export const db = drizzle(connection, { schema, mode: "default" });
