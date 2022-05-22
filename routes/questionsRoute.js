const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");

const { QuestionEntry, QuestionSet } = require("../models/question");

const { wrapAsync } = require("../utils/helper");

//get all questions
router.get(
  "/questions",
  wrapAsync(async function (req, res) {
    const questionEntries = await QuestionEntry.find();
    res.json(questionEntries);
  })
);

//get current question template
router.get(
  "/questionsets",
  wrapAsync(async function (req, res) {
    const questionSet = await QuestionSet.find();
    res.json(questionSet);
  })
);

router.post(
  "/questionsets",
  wrapAsync(async function (req, res) {
    const questionSet = req.body;
    const questionArr = [];

    //for each QE in QS, push to arr
    async.each(questionSet, async (e) => {
      const searchFilter = { ...e };
      const existingQuestionEntry = await QuestionEntry.findOne(searchFilter);

      if (existingQuestionEntry) {
        //if already exist, push old one
        questionArr.push(existingQuestionEntry);
      } else {
        //otherwise create new and push
        const newQuestionEntry = await new QuestionEntry(e).save();
        questionArr.push(newQuestionEntry);
      }
    });

    //save new QS
    const newQuestionSet = await new QuestionSet({
      question_arr: questionArr,
    }).save();

    res.json(newQuestionSet);
  })
);

module.exports = router;
