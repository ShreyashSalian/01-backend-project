const { Op } = require("sequelize");
const has = (src, path = []) => {
  let _path = Array.isArray(path) ? path.slice() : (path || "").split("."),
    o = src,
    idx = 0;

  if (_path.length === 0) {
    return false;
  }

  for (idx = 0; idx < _path.length; idx++) {
    const key = _path[idx];

    if (o != null && o.hasOwnProperty(key)) {
      o = o[key];
    } else {
      return false;
    }
  }
  return true;
};

const extend = (a, b) => {
  for (var key in b) if (b.hasOwnProperty(key)) a[key] = b[key];
  return a;
};
const getFilter = async (options) => {
  let filter = { where: { ...options.filter, or: [] } };

  // manage pagination logic
  if (options.page && options.limit) {
    filter.skip = (options.page - 1) * options.limit;
    filter.limit = options.limit;
  }

  // filter by start with
  if (options.sort) {
    
    const orderField = Object.keys(options.sort)[0]; // Get the sorting field
    const orderDirection = options.sort[orderField]; // Get the sorting direction
    filter.order = [orderField, orderDirection];
  } else {
    filter.order = ["createdAt", "DESC"];
  }

  if (has(options, "is_disable")) {
    filter.where.is_disable = options.is_disable;
  }

  if (has(options, "is_deleted")) {
    filter.where.is_deleted = options.is_deleted;
  }

  // filter by start with
  if (
    options.startWith &&
    options.startWith.keys &&
    options.startWith.keyword
  ) {
    let or = [];
    Object.keys(options.startWith.keys).forEach((key) => {
      let orArray = {};
      orArray[key] = { $regex: options.search.keyword, $options: "i" };
      or.push(orArray);
      filter.where["$or"] = or;
    });
    if (or.length > 0) {
      filter.where["$or"] = or;
    }
  }
  if (options.search && options.search.keys && options.search.keyword) {
    if (filter.where.or && !filter.where.or.length) {
      delete filter.where.or;
    }
    let or = [];
    Object.keys(options.search.keys).forEach((key) => {
      if (key) {
        let orArray = {};
        orArray[key] = { [Op.like]: `%${options.search.keyword}%` };
        or.push(orArray);
      }
    });
    filter.where = Object.assign(
      {},
      {
        [Op.or]: or,
      }
    );
  }

  // NOTE:- keep this filter at end
  if (has(options, "id")) {
    filter = { where: { id: options.id, is_active: true } };
  }

  // Add date range filtering
  if (options.filter && options.filter.startDate && options.filter.endDate) {
    let dateType = options.filter.dateType
      ? options.filter.dateType
      : "createdAt";

    filter.where[dateType] = {
      $gte: startDate(options.filter.startDate),
      $lte: endDate(options.filter.endDate),
    };
  }

  if (
    options.filter &&
    (options.filter.startDate ||
      options.filter.endDate ||
      options.filter.dateType)
  ) {
    delete options.filter.startDate;
    delete options.filter.endDate;
    delete options.filter.dateType;
  }

  // projection by request
  if (options.project) {
    filter.select = options.project;
  }
  if (options.filter) {
    filter.where = extend(filter.where, options.filter);
  }

  if (filter.where.or && !filter.where.or.length) {
    delete filter.where.or;
  }

  return filter;
};

const startDate = (date) => {
  let startDate = new Date(
    new Date(date).setUTCHours(0, 0, 0, 0)
  ).toISOString();
  return startDate;
};

const endDate = (date) => {
  let endDate = new Date(
    new Date(date).setUTCHours(23, 59, 59, 999)
  ).toISOString();
  return endDate;
};

const pageCount = async (filter, filterParams, totalCount) => {
  const totalPages = Math.ceil(totalCount / filterParams.limit);
  return {
    totalPage: totalPages,
    currentPage: filter.page,
  };
};

module.exports = { getFilter, pageCount };
