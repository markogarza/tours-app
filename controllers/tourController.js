// const fs = require('fs');

const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');

// READ FILE FROM A LOCAL FOLDER
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// MIDDELWARE FUNCTIONS
// exports.checkId = (req, res, next, val) => {
//   console.log(`The id is: ${val}`);
//   if (val > tours.length)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price)
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   next();
// };

exports.aliasTopFiveCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,duration,difficulty';
  next();
};

// RouteHandlers
exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // Build Query

    // 1.A) Filtering
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // 1.B) Advance Filtering
    // let queryOp = JSON.stringify(queryObj);
    // queryOp = queryOp.replace(/\bgte|gt|lte|lt\b/g, (el) => `$${el}`);

    // // { difficulty: 'easy', duration: { gte: '5' } }
    // // { difficulty: 'easy', duration: { $gte: '5' } }

    // let query = Tour.find(JSON.parse(queryOp));

    // 2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   // console.log('default sorting -createdAt');
    //   // query = query.sort('-createdAt');
    // }

    // 3) Field Select
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   console.log('default select field: -__v');
    //   query = query.select('-__v');
    // }

    // 4) Pagination, page & limit - NOT WORKING AS EXPECTED!!!
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // console.log(page, limit, skip);
    // query = query.limit(limit).skip(skip);

    // if (req.query.page) {
    //   const numDoc = await Tour.countDocuments();
    //   if (skip >= numDoc) throw new Error('This page  does not exist');
    // }

    // Execute Query
    const features = new ApiFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const allTours = await features.query;

    // Send Reponse
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: null,
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
