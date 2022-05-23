const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");

const { LoggedDataEntry, LoggedDataSet } = require("../models/loggedData");
const { QuestionEntry, QuestionSet } = require("../models/question");

const { parseDate, wrapAsync, dateInRange } = require("../utils/helper");
const { isLoggedIn, isAgentOfLoggedDataSet } = require("../middleware/auth");

//get all logs
router.get(
  "/logs",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const loggedDataEntries = await LoggedDataEntry.find({
      agent: uid,
    }).populate("questions");
    res.json(loggedDataEntries);
  })
);

//get all logsets
router.get(
  "/logsets",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const loggedDataSets = await LoggedDataSet.find({ agent: uid }).populate(
      "logged_data_arr"
    );
    res.json(loggedDataSets);
  })
);

//get logsets/:date
router.get(
  "/logsets/:date",
  isAgentOfLoggedDataSet,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const dateStr = req.params.date;
    const loggedDataSet = await LoggedDataSet.findByDate(dateStr, {
      agent: uid,
    });
    res.json(loggedDataSet);
  })
);

//update logset/:date
router.put(
  "/logsets/:date",
  isAgentOfLoggedDataSet,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const dateStr = req.params.date;
    //find parent
    const oldLoggedDataSet = await LoggedDataSet.findByDate(dateStr, {
      agent: uid,
    });
    const parentId = oldLoggedDataSet._id;
    // [{_id, question, answer}, ...]
    const newLoggedDataArr = req.body;

    //for each existing LDE, update answer
    await async.each(newLoggedDataArr, async (e) => {
      //find matching child LDE and update
      const oldDataEntry = await LoggedDataEntry.findById(e._id);
      if (oldDataEntry.parent.equals(parentId)) {
        oldDataEntry.answer = e.answer;
        oldDataEntry.save();
      }
    });

    const createdLoggedDataSet = await LoggedDataSet.findByDate(dateStr);

    res.json(createdLoggedDataSet);
  })
);

//create logset
router.post(
  "/logsets",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const body = req.body;
    // date
    const date = body.date;
    // [question : _id, answer}, ... ]
    const loggedDataSet = body.logged_data_arr;

    // create initial LDS
    const newLoggedDataSet = await new LoggedDataSet({
      date,
      agent: uid,
    }).save();

    //save new LDE
    const parentId = newLoggedDataSet._id;
    const loggedDataArr = [];
    await async.each(loggedDataSet, async (e) => {
      const newLoggedDataEntry = await new LoggedDataEntry({
        question: e.question,
        answer: e.answer,
        agent: uid,
        parent: parentId,
      }).save();
      loggedDataArr.push(newLoggedDataEntry);
    });

    //save new LDS
    await LoggedDataSet.findByIdAndUpdate(parentId, {
      logged_data_arr: loggedDataArr,
    });

    const createdLoggedDataSet = await LoggedDataSet.findById(
      parentId
    ).populate({ path: "logged_data_arr", populate: { path: "question" } });

    res.json(createdLoggedDataSet);
  })
);

module.exports = router;
