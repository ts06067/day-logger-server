const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");
const eachSeries = require("async/eachSeries");

const { QuestionEntry, QuestionSet } = require("../models/question");

const { wrapAsync } = require("../utils/helper");
const { isLoggedIn } = require("../middleware/auth");

//get all questions
router.get(
  "/questions",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const questionEntries = await QuestionEntry.find({ agent: uid });
    res.json(questionEntries);
  })
);

//get current question template
router.get(
  "/questionsets",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    //get the latest one
    const questionSet = await QuestionSet.findOne({ agent: uid })
      .sort("-createdAt")
      .populate("question_arr");
    res.json(questionSet);
  })
);

router.post(
  "/questionsets",
  isLoggedIn,
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;

    const questionSet = req.body;
    const questionArr = [];

    //for each QE in QS, push to arr
    await async.eachSeries(questionSet, async (e) => {
      //filter: find same text & type_of_question
      const newQuestionEntry = {
        type_of_question: e.type_of_question,
        text: e.text,
        option: e.option,
        agent: uid,
      };
      const existingQuestionEntry = await QuestionEntry.findOne(
        newQuestionEntry
      );

      if (existingQuestionEntry) {
        //if already exist, push old one
        questionArr.push(existingQuestionEntry);
      } else {
        //otherwise create new and push
        const createdQuestionEntry = await new QuestionEntry(
          newQuestionEntry
        ).save();
        questionArr.push(createdQuestionEntry);
      }
    });

    //save new QS
    const newQuestionSet = await new QuestionSet({
      question_arr: questionArr,
      agent: uid,
    }).save();

    res.json(newQuestionSet);
  })
);

module.exports = router;
