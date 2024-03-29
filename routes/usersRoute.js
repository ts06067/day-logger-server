const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { User, UserAddress } = require("../models/user");

const { wrapAsync } = require("../utils/helper");

router.get(
  "/users",
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const user = await User.findById(uid).populate("address");
    res.json(user);
  })
);

router.put(
  "/users",
  wrapAsync(async function (req, res) {
    const uid = req.session.userId;
    const body = req.body;
    const { name, imgUrl, email } = body;
    // {address_1, address_2}
    const { address_1, address_2 } = body;

    //update user address
    let userAddress = await UserAddress.findOne({ agent: uid });
    if (userAddress) {
      await UserAddress.findByIdAndUpdate(userAddress._id, {
        address_1,
        address_2,
      });
    } else {
      //if for first time, create new and save
      const newUserAddress = new UserAddress({
        address_1,
        address_2,
        agent: uid,
      });
      userAddress = await newUserAddress.save();
    }

    //update other fields
    const updatedUser = await User.findByIdAndUpdate(uid, {
      name,
      imgUrl,
      email,
      address: userAddress,
    }).populate("address");

    res.json(updatedUser);
  })
);

router.post(
  "/register",
  wrapAsync(async function (req, res) {
    const { password, email, name } = req.body;
    const newUser = await new User({ password, email, name }).save();
    if (newUser) {
      req.session.userId = newUser._id; //auto login after register success
      res.sendStatus(204);
    } else {
      res.sendStatus(401);
    }
  })
);

router.post(
  "/login",
  wrapAsync(async function (req, res) {
    const { email, password } = req.body;
    const user = await User.findAndValidate(email, password);
    if (user) {
      req.session.userId = user._id;
      res.sendStatus(204);
    } else {
      res.sendStatus(401);
    }
  })
);

router.post(
  "/logout",
  wrapAsync(async function (req, res) {
    req.session.userId = null;
    res.sendStatus(204);
  })
);

module.exports = router;
