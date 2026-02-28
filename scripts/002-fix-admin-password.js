const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

const sql = neon(process.env.DATABASE_URL);

async function fixAdmin() {
  // Properly hash the password using bcrypt
  const hash = await bcrypt.hash("admin123", 10);
  console.log("Generated hash:", hash);

  // Verify the hash works
  const verified = await bcrypt.compare("admin123", hash);
  console.log("Hash verification:", verified);

  // Delete existing admin and re-insert with correct hash
  await sql`DELETE FROM admin_users WHERE email = 'admin@yoga.com'`;
  await sql`INSERT INTO admin_users (email, password_hash, name) VALUES ('admin@yoga.com', ${hash}, 'Admin')`;
  
  // Verify it was stored correctly
  const rows = await sql`SELECT * FROM admin_users WHERE email = 'admin@yoga.com'`;
  console.log("Stored user:", rows[0]?.email, "Hash starts:", rows[0]?.password_hash?.substring(0, 20));
  
  // Final check
  const finalCheck = await bcrypt.compare("admin123", rows[0].password_hash);
  console.log("Final verification:", finalCheck);
  
  console.log("Admin password fixed!");
}

fixAdmin().catch(console.error);
