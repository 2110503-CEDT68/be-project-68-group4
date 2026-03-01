const Dentist = require('../models/Dentist');
const Hospital = require('../models/Hospital');

// @desc      Get all dentists (optionally filtered by hospital)
// @route     GET /api/v1/dentists
// @route     GET /api/v1/hospitals/:hospitalId/dentists
// @access    Public
exports.getDentists = async (req, res, next) => {
  try {
    let query;

    if (req.params.hospitalId) {
      query = Dentist.find({ hospital: req.params.hospitalId });
    } else {
      query = Dentist.find().populate({
        path: 'hospital',
        select: 'name province tel',
      });
    }

    const dentists = await query;

    res.status(200).json({
      success: true,
      count: dentists.length,
      data: dentists,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot find dentists' });
  }
};

// @desc      Get single dentist
// @route     GET /api/v1/dentists/:id
// @access    Public
exports.getDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findById(req.params.id).populate({
      path: 'hospital',
      select: 'name province tel',
    });

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: dentist });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot find dentist' });
  }
};

// @desc      Create dentist
// @route     POST /api/v1/hospitals/:hospitalId/dentists
// @access    Private/Admin
exports.createDentist = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;

    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with the id of ${req.params.hospitalId}`,
      });
    }

    const dentist = await Dentist.create(req.body);

    res.status(201).json({ success: true, data: dentist });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: 'Cannot create dentist' });
  }
};

// @desc      Update dentist
// @route     PUT /api/v1/dentists/:id
// @access    Private/Admin
exports.updateDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: dentist });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: 'Cannot update dentist' });
  }
};

// @desc      Delete dentist
// @route     DELETE /api/v1/dentists/:id
// @access    Private/Admin
exports.deleteDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findById(req.params.id);

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.params.id}`,
      });
    }

    await dentist.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: 'Cannot delete dentist' });
  }
};
