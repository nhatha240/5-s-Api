const upload = require('../config/uploadFile');
const multer = require('multer');

const uploadImage = function (field, type = 'single') {
  return async (req, res, next) => {
    try {
      if (!req.files) {
        return next();
      }
      if (type === 'single') {
        upload.single(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the file: ${err}` });
          } else if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
          } else {
            console.log('req.file', req.file);
            req.body[field] = req.file.path;
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
            return res.status(400).send({ message: 'No files uploaded' });
          } else {
            req.body[field] = req.files.map(file => file.path);
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
            return res.status(400).send({ message: 'No files uploaded' });
          } else {
            field.forEach((fieldObj) => {
              const fieldName = fieldObj.name;
              if (req.files[fieldName]) {
                req.body[fieldName] = req.files[fieldName].map(file => file.path);
              }
            });
            return next();
          }
        });
      }
    } catch (error) {
      console.log(error);
      console.log('error file', req.files);
      return next();
    }
  };
};

module.exports = uploadImage;
