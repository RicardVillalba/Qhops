
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: 'your cloud_name',
  api_key: 'yoyr api_key',
  api_secret: 'your api_secret'
  });

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'name folder',
  allowedFormats: ['jpg', 'png', 'gif','jpeg']
});
 
const parser = multer({ storage: storage });

module.exports = parser