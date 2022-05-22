const mongoose = require("mongoose");

const { parseDate, dateInRange } = require("../utils/helper");

const Schema = mongoose.Schema;

const LoggedDataEntrySchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: "LoggedDataSet" },
  question: { type: Schema.Types.ObjectId, ref: "QuestionEntry" },
  answer: { type: String },
  agent: { type: Schema.Types.ObjectId, ref: "User" },
});

const LoggedDataSetSchema = new Schema({
  date: { type: Date, unique: true },
  logged_data_arr: [{ type: Schema.Types.ObjectId, ref: "LoggedDataEntry" }],
  agent: { type: Schema.Types.ObjectId, ref: "User" },
});

LoggedDataSetSchema.statics.findByDate = async function (dateStr, extraFilter) {
  const date = parseDate(dateStr);

  //find by date in range [DATE, DATE+1)
  return await this.findOne({
    date: dateInRange(date),
    ...extraFilter,
  }).populate({ path: "logged_data_arr", populate: { path: "question" } });
};

const LoggedDataEntry = mongoose.model(
  "LoggedDataEntry",
  LoggedDataEntrySchema
);
const LoggedDataSet = mongoose.model("LoggedDataSet", LoggedDataSetSchema);

module.exports = { LoggedDataEntry, LoggedDataSet };
