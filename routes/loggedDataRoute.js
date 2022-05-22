const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");

const { LoggedDataEntry, LoggedDataSet } = require("../models/loggedData");
const { QuestionEntry, QuestionSet } = require("../models/question");

const { parseDate, wrapAsync, dateInRange } = require("../utils/helper");

//get all logs
router.get(
  "/logs",
  wrapAsync(async function (req, res) {
    const loggedDataEntries = await LoggedDataEntry.find().populate(
      "questions"
    );
    res.json(loggedDataEntries);
  })
);

//get all logsets
router.get(
  "/logsets",
  wrapAsync(async function (req, res) {
    const loggedDataSets = await LoggedDataSet.find().populate(
      "logged_data_arr"
    );
    res.json(loggedDataSets);
  })
);

//get logsets/:date
router.get(
  "/logsets/:date",
  wrapAsync(async function (req, res) {
    const dateStr = req.params.date;
    const date = parseDate(dateStr);

    const aggregatePipeline = {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "author",
        as: "books",
      },
    };

    //find by date in range [DATE, DATE+1)
    const loggedDataSet = await LoggedDataSet.findOne({
      date: dateInRange(date),
    }).populate({ path: "logged_data_arr", populate: { path: "question" } });

    res.json(loggedDataSet);
  })
);

router.put(
  "/logsets",
  wrapAsync(async function (req, res) {
    const body = req.body;
    // date
    const date = body.date;
    // [question : _id, old_answer, new_answer}, ... ]
    const loggedDataSet = body.logged_data_arr;

    //for each existing LDE, update answer
    async.each(loggedDataSet, async (e) => {
      //exclude new_answer in search field
      const searchFilter = { question: e.question, answer: e.old_answer };
      //find matching LDE
      const oldLoggedDataEntry = await LoggedDataEntry.findOne(searchFilter);
      //update to new_answer
      await LoggedDataEntry.findByIdAndUpdate(oldLoggedDataEntry._id, {
        answer: e.new_answer,
      });
    });

    res.json(loggedDataSet);
  })
);

router.post(
  "/logsets",
  wrapAsync(async function (req, res) {
    const body = req.body;
    // date
    const date = body.date;
    // [question : _id, answer}, ... ]
    const loggedDataSet = body.logged_data_arr;

    //save new LDE
    const newLoggedDataEntries = await LoggedDataEntry.insertMany(
      loggedDataSet
    );
    //save new LDS
    const newLoggedDataSet = await new LoggedDataSet({
      date,
      logged_data_arr: newLoggedDataEntries,
    }).save();

    res.json(newLoggedDataSet);
  })
);

module.exports = router;
