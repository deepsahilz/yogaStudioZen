const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database with dummy data...");

  // --- Trainers ---
  await sql`DELETE FROM attendance`;
  await sql`DELETE FROM schedules`;
  await sql`DELETE FROM students`;
  await sql`DELETE FROM batches`;
  await sql`DELETE FROM trainers`;
  console.log("Cleared existing data");

  const [t1] = await sql`INSERT INTO trainers (name, specialization, contact, experience) VALUES ('Ananya Sharma', 'Hatha Yoga', '9876543210', 8) RETURNING id`;
  const [t2] = await sql`INSERT INTO trainers (name, specialization, contact, experience) VALUES ('Rohan Mehta', 'Vinyasa Flow', '9876543211', 5) RETURNING id`;
  const [t3] = await sql`INSERT INTO trainers (name, specialization, contact, experience) VALUES ('Priya Patel', 'Power Yoga', '9876543212', 10) RETURNING id`;
  const [t4] = await sql`INSERT INTO trainers (name, specialization, contact, experience) VALUES ('Deepak Joshi', 'Ashtanga Yoga', '9876543213', 12) RETURNING id`;
  const [t5] = await sql`INSERT INTO trainers (name, specialization, contact, experience) VALUES ('Kavita Nair', 'Yin Yoga', '9876543214', 6) RETURNING id`;
  console.log("Inserted 5 trainers");

  // --- Batches ---
  const [b1] = await sql`INSERT INTO batches (name, trainer_id, batch_time) VALUES ('Sunrise Hatha', ${t1.id}, 'morning') RETURNING id`;
  const [b2] = await sql`INSERT INTO batches (name, trainer_id, batch_time) VALUES ('Evening Vinyasa', ${t2.id}, 'evening') RETURNING id`;
  const [b3] = await sql`INSERT INTO batches (name, trainer_id, batch_time) VALUES ('Morning Power', ${t3.id}, 'morning') RETURNING id`;
  const [b4] = await sql`INSERT INTO batches (name, trainer_id, batch_time) VALUES ('Twilight Ashtanga', ${t4.id}, 'evening') RETURNING id`;
  const [b5] = await sql`INSERT INTO batches (name, trainer_id, batch_time) VALUES ('Dawn Yin', ${t5.id}, 'morning') RETURNING id`;
  console.log("Inserted 5 batches");

  // --- Students (20 total, spread across batches) ---
  const studentsData = [
    { name: 'Aarav Gupta', age: 25, gender: 'male', contact: '9001000001', address: '12 MG Road, Mumbai', batch_id: b1.id },
    { name: 'Meera Reddy', age: 30, gender: 'female', contact: '9001000002', address: '45 Park Street, Kolkata', batch_id: b1.id },
    { name: 'Vikram Singh', age: 35, gender: 'male', contact: '9001000003', address: '78 Rajpath, Delhi', batch_id: b1.id },
    { name: 'Sneha Iyer', age: 28, gender: 'female', contact: '9001000004', address: '23 Brigade Road, Bangalore', batch_id: b1.id },
    { name: 'Rahul Das', age: 22, gender: 'male', contact: '9001000005', address: '56 Salt Lake, Kolkata', batch_id: b2.id },
    { name: 'Pooja Verma', age: 27, gender: 'female', contact: '9001000006', address: '89 Connaught Place, Delhi', batch_id: b2.id },
    { name: 'Arjun Nair', age: 32, gender: 'male', contact: '9001000007', address: '34 Marine Drive, Mumbai', batch_id: b2.id },
    { name: 'Divya Kulkarni', age: 29, gender: 'female', contact: '9001000008', address: '67 FC Road, Pune', batch_id: b2.id },
    { name: 'Siddharth Jain', age: 40, gender: 'male', contact: '9001000009', address: '12 Jubilee Hills, Hyderabad', batch_id: b3.id },
    { name: 'Nisha Pillai', age: 26, gender: 'female', contact: '9001000010', address: '45 MG Road, Kochi', batch_id: b3.id },
    { name: 'Karan Malhotra', age: 33, gender: 'male', contact: '9001000011', address: '78 Sector 17, Chandigarh', batch_id: b3.id },
    { name: 'Ritu Agarwal', age: 24, gender: 'female', contact: '9001000012', address: '23 Civil Lines, Jaipur', batch_id: b3.id },
    { name: 'Amit Saxena', age: 38, gender: 'male', contact: '9001000013', address: '56 Hazratganj, Lucknow', batch_id: b4.id },
    { name: 'Lakshmi Rao', age: 31, gender: 'female', contact: '9001000014', address: '89 Banjara Hills, Hyderabad', batch_id: b4.id },
    { name: 'Nikhil Chopra', age: 27, gender: 'male', contact: '9001000015', address: '34 Koregaon Park, Pune', batch_id: b4.id },
    { name: 'Anjali Menon', age: 29, gender: 'female', contact: '9001000016', address: '67 Lalbagh Road, Bangalore', batch_id: b4.id },
    { name: 'Rajesh Kumar', age: 45, gender: 'male', contact: '9001000017', address: '12 Anna Nagar, Chennai', batch_id: b5.id },
    { name: 'Swati Bhatt', age: 23, gender: 'female', contact: '9001000018', address: '45 Ashram Road, Ahmedabad', batch_id: b5.id },
    { name: 'Manish Tiwari', age: 36, gender: 'male', contact: '9001000019', address: '78 Gomti Nagar, Lucknow', batch_id: b5.id },
    { name: 'Aditi Deshmukh', age: 26, gender: 'female', contact: '9001000020', address: '23 Deccan, Pune', batch_id: b5.id },
  ];

  const studentIds = [];
  for (const s of studentsData) {
    const [row] = await sql`INSERT INTO students (name, age, gender, contact, address, batch_id) VALUES (${s.name}, ${s.age}, ${s.gender}, ${s.contact}, ${s.address}, ${s.batch_id}) RETURNING id, batch_id`;
    studentIds.push(row);
  }
  console.log("Inserted 20 students");

  // --- Attendance (last 7 days for all students) ---
  const today = new Date();
  let attendanceCount = 0;
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends (Sunday)
    if (date.getDay() === 0) continue;

    for (const student of studentIds) {
      // ~80% present, ~20% absent
      const status = Math.random() < 0.8 ? 'present' : 'absent';
      await sql`INSERT INTO attendance (student_id, batch_id, date, status) VALUES (${student.id}, ${student.batch_id}, ${dateStr}, ${status}) ON CONFLICT (student_id, date) DO NOTHING`;
      attendanceCount++;
    }
  }
  console.log(`Inserted ${attendanceCount} attendance records`);

  // --- Schedules (weekly for each batch) ---
  const yogaTypes = {
    [b1.id]: { Monday: 'Sun Salutation', Tuesday: 'Standing Poses', Wednesday: 'Seated Poses', Thursday: 'Backbends', Friday: 'Inversions', Saturday: 'Restorative' },
    [b2.id]: { Monday: 'Vinyasa Flow A', Tuesday: 'Vinyasa Flow B', Wednesday: 'Core Vinyasa', Thursday: 'Balance Flow', Friday: 'Hip Opening Flow', Saturday: 'Full Body Flow' },
    [b3.id]: { Monday: 'Power Sequence 1', Tuesday: 'Power Arms', Wednesday: 'Power Core', Thursday: 'Power Legs', Friday: 'Power Balance', Saturday: 'Power Endurance' },
    [b4.id]: { Monday: 'Primary Series', Tuesday: 'Standing Sequence', Wednesday: 'Seated Sequence', Thursday: 'Finishing Sequence', Friday: 'Full Primary', Saturday: 'Led Practice' },
    [b5.id]: { Monday: 'Yin Hips', Tuesday: 'Yin Spine', Wednesday: 'Yin Legs', Thursday: 'Yin Upper Body', Friday: 'Yin Meridians', Saturday: 'Yin Restorative' },
  };

  let scheduleCount = 0;
  for (const batchId of [b1.id, b2.id, b3.id, b4.id, b5.id]) {
    const batchSchedule = yogaTypes[batchId];
    for (const [day, yogaType] of Object.entries(batchSchedule)) {
      await sql`INSERT INTO schedules (batch_id, day_of_week, yoga_type) VALUES (${batchId}, ${day}, ${yogaType}) ON CONFLICT (batch_id, day_of_week) DO NOTHING`;
      scheduleCount++;
    }
  }
  console.log(`Inserted ${scheduleCount} schedule entries`);

  console.log("Seeding complete!");
}

seed().catch(console.error);
