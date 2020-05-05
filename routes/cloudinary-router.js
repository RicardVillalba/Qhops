const express = require("express");
const Admin = require("./../models/admin-model");
const router = express.Router();
const parser = require("../config/cloudinary");

router.post("/profile-picture", parser.single("photo"), (req, res, next) => {
  const { title, description, id } = req.body;
  const image_url = req.file.secure_url;

  const profilePicture = new Gif({
    title,
    description,
    image_url,
  });

  newGif
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
});

module.exports = router;
