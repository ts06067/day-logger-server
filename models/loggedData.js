const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LoggedDataEntrySchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: "QuestionEntry" },
  answer: { type: String },
  //agent
});

const LoggedDataSetSchema = new Schema({
  date: { type: Date, unique: true },
  logged_data_arr: [{ type: Schema.Types.ObjectId, ref: "LoggedDataEntry" }],
  //agent
});

const LoggedDataEntry = mongoose.model(
  "LoggedDataEntry",
  LoggedDataEntrySchema
);
const LoggedDataSet = mongoose.model("LoggedDataSet", LoggedDataSetSchema);

module.exports = { LoggedDataEntry, LoggedDataSet };
