const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("../utils/validators");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  address: { type: Schema.Types.ObjectId, ref: "UserAddress" },
  imgUrl: { type: String },
  email: {
    type: String,
    validate: {
      validator: validator.validateEmail,
      message: (props) => `${props.value} is not a valid email!`,
    },
    required: true,
    trim: true, // This will trim the whitespace automatically from the email before saving
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const UserAddressSchema = new Schema({
  address_1: { type: String },
  address_2: { type: String },
  agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

UserSchema.statics.findAndValidate = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    return false;
  }
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : false;
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);
const UserAddress = mongoose.model("UserAddress", UserAddressSchema);

module.exports = { User, UserAddress };
