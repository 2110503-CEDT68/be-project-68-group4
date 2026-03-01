const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Hospital = require('./models/Hospital');
const Dentist = require('./models/Dentist');
const Appointment = require('./models/Appointment');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedHospitals = async () => {
  try {
    // Read CSV file
    const csvData = fs.readFileSync('./hospitals.csv', 'utf8');
    const lines = csvData.split('\n');
    
    // Skip header line
    const hospitals = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handle commas in quotes)
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
          region: values[7]
        });
      }
    }
    
    // Delete existing hospitals, dentists, and appointments (they reference hospitals)
    await Appointment.deleteMany({});
    await Dentist.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Deleted existing hospitals'.red.inverse);
    
    // Insert hospitals one by one to handle duplicates
    let successCount = 0;
    let skipCount = 0;
    
    for (const hospital of hospitals) {
      try {
        await Hospital.create(hospital);
        successCount++;
      } catch (err) {
        if (err.code === 11000) {
          console.log(`Skipped duplicate: ${hospital.name}`.yellow);
          skipCount++;
        } else {
          throw err;
        }
      }
    }
    
    console.log(`${successCount} hospitals imported successfully`.green.inverse);
    if (skipCount > 0) {
      console.log(`${skipCount} duplicates skipped`.yellow);
    }
    
    // Count Bangkok hospitals
    const bkkCount = await Hospital.countDocuments({ province: 'กรุงเทพมหานคร' });
    console.log(`Bangkok hospitals: ${bkkCount}`.cyan);
    
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    console.error(err.stack);
    process.exit(1);
  }
};

seedHospitals();
