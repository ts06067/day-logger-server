// This is a function we can use to wrap our existing async route functions so they automatically catch errors
// and call the next() handler
const wrapAsync = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

const parseDate = function (str) {
  //YYYYMMDD
  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6)) - 1; //0-indexed
  const date = parseInt(str.substring(6, 8));
  return new Date(year, month, date);
};

const dateInRange = function (date) {
  //type of date: Date
  const dateInMS = date.getTime();
  const dayToMS = 60 * 60 * 24 * 1000;
  const nextDateInMS = dateInMS + 1 * dayToMS;

  return {
    $gte: new Date(dateInMS),
    $lt: new Date(nextDateInMS),
  };
};

module.exports = { wrapAsync, parseDate, dateInRange };
