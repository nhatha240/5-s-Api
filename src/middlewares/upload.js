const upload = require('../config/uploadFile');
const multer = require('multer');
const {Images} = require('../models/index');
const uploadImage = function (field, type = 'single') {
  return async (req, res, next) => {
    try {
      if (type === 'single') {
        upload.single(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the file: ${err}` });
          } else if (!req.file) {
            return next();
            // return res.status(400).send({ message: 'No file uploaded' });
          } else {
            req.body[field] = req.file.path;
            Images.create({path: req.file.path})
            return next();
          }
        });
      } else if (type === 'array') {
        upload.array(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the files: ${err}` });
          } else if (!req.files || req.files.length === 0) {
            return next();
          } else {
            req.body[field] = req.files.map((file) => {
              const filepath = file.path
              Images.create({path: filepath})
              return filepath;
            });
            return next();
          }
        });
      } else if (type === 'fields') {
        upload.fields(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the files: ${err}` });
          } else if (!req.files) {
            return next();
          } else {
            field.forEach((fieldObj) => {
              const fieldName = fieldObj.name;
              if (req.files[fieldName]) {
                req.body[fieldName] = req.files[fieldName].map((file) => {
                  const filepath = file.path
                  Images.create({path: filepath})
                  return filepath;
                });
              }
            });
            return next();
          }
        });
      }
    } catch (error) {
      console.error(error);
      return next();
    }
  };
};

module.exports = uploadImage;
