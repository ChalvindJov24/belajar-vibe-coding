import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Load .env manually if process.env.DATABASE_URL is not set
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const lines = envContent.split(/\r?\n/);
      const dbUrlLine = lines.find(line => line.trim().startsWith("DATABASE_URL="));
      if (dbUrlLine) {
        let value = dbUrlLine.split("=")[1].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        databaseUrl = value;
      }
    }
  } catch (e) {
    console.error("Failed to read .env file in init.ts", e);
  }
}

const connectionString = databaseUrl || "mysql://root:@localhost:3306/belajar_vibe_coding";

try {
  console.log("Initializing database connection settings...");
  const url = new URL(connectionString);
  const databaseName = url.pathname.substring(1);
  const connectionUrlWithoutDb = `${url.protocol}//${url.username}${url.password ? `:${url.password}` : ""}@${url.host}`;
  
  console.log(`Connecting to MySQL server at ${url.host} to check database: "${databaseName}"...`);
  const adminConnection = await mysql.createConnection(connectionUrlWithoutDb);
  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
  await adminConnection.end();
  console.log(`Database "${databaseName}" has been successfully checked and created/ensured.`);
  process.exit(0);
} catch (error: any) {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
}
