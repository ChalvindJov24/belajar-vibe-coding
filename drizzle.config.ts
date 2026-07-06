import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// Parse .env file manually if process.env.DATABASE_URL is not set
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
        // Remove surrounding quotes if they exist
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        databaseUrl = value;
      }
    }
  } catch (e) {
    console.error("Failed to read .env file", e);
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl || "mysql://root:@localhost:3306/belajar_vibe_coding",
  },
});
