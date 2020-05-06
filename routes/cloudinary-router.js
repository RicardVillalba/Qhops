const express = require("express");
const Admin = require("./../models/admin-model");
const router = express.Router();
const parser = require("../config/cloudinary");

router.post("/profile-picture", parser.single("photo"), (req, res, next) => {
  const image_url = req.file.secure_url;
  const adminId = req.session.currentUser._id;
  Admin.findByIdAndUpdate(adminId, { "picture.image_url": image_url }, {new: true})

    .then((user) => {
      req.session.currentUser = user;
      res.redirect("/profile")
    })
    .catch((err) => console.log(err));
});

module.exports = router;
