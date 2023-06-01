class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1.B) Advance Filtering
    let queryOp = JSON.stringify(queryObj);
    queryOp = queryOp.replace(/\bgte|gt|lte|lt\b/g, (el) => `$${el}`);

    // { difficulty: 'easy', duration: { gte: '5' } }
    // { difficulty: 'easy', duration: { $gte: '5' } }

    this.query.find(JSON.parse(queryOp));
    // let query = Tour.find(JSON.parse(queryOp));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // console.log('default sorting -createdAt');
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      console.log('default select field: -__v');
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);
    this.query = this.query.limit(limit).skip(skip);

    return this;
  }
}
module.exports = ApiFeatures;
