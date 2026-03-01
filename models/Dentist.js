const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a dentist name'],
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Please add years of experience'],
      min: [0, 'Years of experience cannot be negative'],
    },
    areaOfExpertise: {
      type: String,
      required: [true, 'Please add area of expertise'],
      trim: true,
    },
    hospital: {
      type: mongoose.Schema.ObjectId,
      ref: 'Hospital',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Dentist', DentistSchema);
