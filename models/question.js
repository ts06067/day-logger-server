const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QuestionEntrySchema = new Schema({
  type_of_question: { type: String },
  text: { type: String, unique: true },
  //agent
});

const QuestionSetSchema = new Schema(
  {
    question_arr: [{ type: Schema.Types.ObjectId, ref: "QuestionEntry" }],
    //agent
  },
  { timestamps: true }
);

const QuestionEntry = mongoose.model("QuestionEntry", QuestionEntrySchema);
const QuestionSet = mongoose.model("QuestionSet", QuestionSetSchema);

module.exports = { QuestionEntry, QuestionSet };
