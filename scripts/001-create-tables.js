const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Created admin_users table");

  await sql`
    CREATE TABLE IF NOT EXISTS trainers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      specialization VARCHAR(255) NOT NULL,
      contact VARCHAR(50) NOT NULL,
      experience INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Created trainers table");

  await sql`
    CREATE TABLE IF NOT EXISTS batches (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
      batch_time VARCHAR(20) NOT NULL CHECK (batch_time IN ('morning', 'evening')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Created batches table");

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INTEGER NOT NULL,
      gender VARCHAR(20) NOT NULL,
      contact VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Created students table");

  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, date)
    )
  `;
  console.log("Created attendance table");

  await sql`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
      yoga_type VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(batch_id, day_of_week)
    )
  `;
  console.log("Created schedules table");

  // Insert default admin user (password: admin123)
  // Pre-hashed bcrypt hash for 'admin123'
  await sql`
    INSERT INTO admin_users (email, password_hash, name)
    VALUES ('admin@yoga.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'Admin')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log("Inserted default admin user (admin@yoga.com / admin123)");

  console.log("Migration complete!");
}

migrate().catch(console.error);
