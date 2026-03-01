const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const Dentist = require('../models/Dentist');

// @desc      Get all appointments
// @route     GET /api/v1/appointments
// @access    Public
exports.getAppointments = async (req, res, next) => {
  let query;

  const populateOptions = [
    { path: 'hospital', select: 'name province tel' },
    { path: 'dentist', select: 'name yearsOfExperience areaOfExpertise' },
  ];

  // General users can see only their appointments
  if (req.user.role !== 'admin') {
    query = Appointment.find({ user: req.user.id }).populate(populateOptions);
  } else {
    // Admin can see all
    if (req.params.hospitalId) {
      query = Appointment.find({ hospital: req.params.hospitalId }).populate(populateOptions);
    } else {
      query = Appointment.find().populate(populateOptions);
    }
  }

  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot find Appointment' });
  }
};

// @desc      Get single appointment
// @route     GET /api/v1/appointments/:id
// @access    Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate([
      { path: 'hospital', select: 'name description tel' },
      { path: 'dentist', select: 'name yearsOfExperience areaOfExpertise' },
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot find Appointment' });
  }
};

// @desc      Add appointment
// @route     POST /api/v1/hospitals/:hospitalId/appointments
// @access    Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;

    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with the id of ${req.params.hospitalId}`,
      });
    }

    // Validate dentist exists and belongs to this hospital
    const dentist = await Dentist.findById(req.body.dentist);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.body.dentist}`,
      });
    }
    if (dentist.hospital.toString() !== req.params.hospitalId) {
      return res.status(400).json({
        success: false,
        message: `Dentist does not belong to hospital ${req.params.hospitalId}`,
      });
    }

    // Add user Id to req.body
    req.body.user = req.user.id;

    // Check for existed appointment — users can only have 1 booking
    const existedAppointments = await Appointment.find({ user: req.user.id });

    if (existedAppointments.length >= 1 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made a booking. Only 1 booking is allowed per user.`,
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot create Appointment' });
  }
};

// @desc      Update appointment
// @route     PUT /api/v1/appointments/:id
// @access    Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot update Appointment' });
  }
};

// @desc      Delete appointment
// @route     DELETE /api/v1/appointments/:id
// @access    Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this bootcamp`,
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot delete Appointment' });
  }
};
