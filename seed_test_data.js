const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const fs = require('fs');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Dentist = require('./models/Dentist');
const Appointment = require('./models/Appointment');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedTestData = async () => {
  try {
    // Clear existing data
    await Appointment.deleteMany({});
    await Dentist.deleteMany({});
    await User.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Cleared existing data'.red.inverse);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '12345678',
      role: 'admin',
      tel: '0812345678',
    });
    console.log('Admin created'.green);

    // Create regular test user
    const user8 = await User.create({
      name: 'User Eight',
      email: 'user8@gmail.com',
      password: '12345678',
      role: 'user',
      tel: '0898765432',
    });
    console.log('User8 created'.green);

    // Import hospitals from CSV
    const csvData = fs.readFileSync('./hospitals.csv', 'utf8');
    const lines = csvData.split('\n');

    const hospitals = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = [];
      let current = '';
      let inQuotes = false;

      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length >= 8) {
        hospitals.push({
          name: values[1],
          address: values[2],
          district: values[3],
          province: values[4],
          postalcode: values[5],
          tel: values[6],
          region: values[7],
        });
      }
    }

    const createdHospitals = [];
    for (const hospital of hospitals) {
      try {
        const created = await Hospital.create(hospital);
        createdHospitals.push(created);
      } catch (err) {
        if (err.code === 11000) continue; // skip duplicates
        else throw err;
      }
    }
    console.log(`${createdHospitals.length} hospitals imported`.green);

    // Seed dentists — 3 dentists per the first 3 hospitals
    const dentistData = [
      { name: 'Dr. สมชาย ใจดี',    yearsOfExperience: 10, areaOfExpertise: 'General Dentistry' },
      { name: 'Dr. วิภา รักษ์ฟัน',  yearsOfExperience: 7,  areaOfExpertise: 'Orthodontics' },
      { name: 'Dr. ประเสริฐ ฟันดี', yearsOfExperience: 15, areaOfExpertise: 'Oral Surgery' },
      { name: 'Dr. นภา สุขใส',      yearsOfExperience: 5,  areaOfExpertise: 'Pediatric Dentistry' },
      { name: 'Dr. ชาญ เชี่ยวชาญ', yearsOfExperience: 12, areaOfExpertise: 'Periodontics' },
      { name: 'Dr. มาลี ยิ้มแย้ม',  yearsOfExperience: 8,  areaOfExpertise: 'Cosmetic Dentistry' },
      { name: 'Dr. อนันต์ แข็งแรง', yearsOfExperience: 20, areaOfExpertise: 'Endodontics' },
      { name: 'Dr. สุดา ขยัน',      yearsOfExperience: 3,  areaOfExpertise: 'General Dentistry' },
      { name: 'Dr. ธีรพล ฉลาด',    yearsOfExperience: 9,  areaOfExpertise: 'Prosthodontics' },
    ];

    const createdDentists = [];
    for (let i = 0; i < 9; i++) {
      const hospitalIndex = Math.floor(i / 3); // 3 dentists per hospital
      if (!createdHospitals[hospitalIndex]) continue;
      const dentist = await Dentist.create({
        ...dentistData[i],
        hospital: createdHospitals[hospitalIndex]._id,
      });
      createdDentists.push(dentist);
    }
    console.log(`${createdDentists.length} dentists created`.green);

    // Create 1 appointment for user8 (dentist booking system allows only 1)
    if (createdHospitals[0] && createdDentists[0]) {
      await Appointment.create({
        apptDate: new Date('2026-04-15T10:00:00.000Z'),
        user: user8._id,
        hospital: createdHospitals[0]._id,
        dentist: createdDentists[0]._id,
      });
      console.log('1 appointment created for user8'.green);
    }

    // Summary
    console.log('\n=== Database Statistics ==='.cyan.bold);
    console.log(`Total hospitals: ${await Hospital.countDocuments()}`.cyan);
    console.log(`Total dentists:  ${await Dentist.countDocuments()}`.cyan);
    console.log(`Total users:     ${await User.countDocuments()}`.cyan);
    console.log(`Total appointments: ${await Appointment.countDocuments()}`.cyan);
    console.log('\nCredentials:'.yellow);
    console.log('  Admin  -> admin@gmail.com  / 12345678'.yellow);
    console.log('  User   -> user8@gmail.com  / 12345678'.yellow);

    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    console.error(err.stack);
    process.exit(1);
  }
};

seedTestData();
