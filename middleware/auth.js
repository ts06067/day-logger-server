const { LoggedDataEntry, LoggedDataSet } = require("../models/loggedData");
const { wrapAsync } = require("../utils/helper");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    throw new Error("Need to login first");
  }
  next();
};

// If the author has an agent, the logged in user must be that agent to access
module.exports.isAgentOfLoggedDataSet = wrapAsync(async (req, res, next) => {
  const dateStr = req.params.date;
  const lds = await LoggedDataSet.findByDate(dateStr);
  if (lds.agent && !lds.agent.equals(req.session.userId)) {
    throw new Error("Not an authorized agent for this LDS", 401);
  }
  next();
});

//isAdmin
