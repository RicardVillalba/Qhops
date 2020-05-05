
const express = require("express");
const Admin = require('./../models/admin-model')



const parser = require('./../config/cloudinary');

router.post('/profile-picture', parser.single('photo'), (req, res, next) => {

    const image_url = req.file.secure_url

})