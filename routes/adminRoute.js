const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");
const eachSeries = require("async/eachSeries");

const { User } = require("../models/user");
const { LoggedDataEntry, LoggedDataSet } = require("../models/loggedData");
const { QuestionEntry, QuestionSet } = require("../models/question");

const { parseDate, wrapAsync, dateInRange } = require("../utils/helper");
const { isAdmin } = require("../middleware/auth");

//get stats
router.get(
  "/stat",
  isAdmin,
  wrapAsync(async function (req, res) {
    const statArr = [];
    const users = await User.find({}).populate("address");

    await async.eachSeries(users, async (u) => {
      const uid = u._id;

      const numQuestionEntries = (await QuestionEntry.find({ agent: uid }))
        .length;
      const numLoggedDataEntries = (await LoggedDataEntry.find({ agent: uid }))
        .length;

      statArr.push({
        user: { name: u.name, email: u.email },
        numQuestionEntries,
        numLoggedDataEntries,
      });
    });

    res.json(statArr);
  })
);

//delete a user
router.delete(
  "/user/:id",
  isAdmin,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const id = req.params.id;

    if (id != uid) {
      //cannot delete self
      const deletedUser = await User.findByIdAndDelete(id);
      res.sendStatus(204);
    } else {
      res.sendStatus(401);
    }
  })
);

module.exports = router;
