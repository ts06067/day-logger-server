const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const async = require("async");

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
    await async.each(questionSet, async (e) => {
      //filter: find same text & type_of_question
      const searchFilter = {
        text: e.text,
        type_of_question: e.type_of_question,
        agent: uid,
      };
      const existingQuestionEntry = await QuestionEntry.findOne(searchFilter);

      if (existingQuestionEntry) {
        //if already exist, push old one
        questionArr.push(existingQuestionEntry);
      } else {
        //otherwise create new and push
        const newQuestionEntry = await new QuestionEntry({
          type_of_question: e.type_of_question,
          text: e.text,
          agent: uid,
        }).save();
        questionArr.push(newQuestionEntry);
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
