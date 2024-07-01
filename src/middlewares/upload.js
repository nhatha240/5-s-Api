const upload = require('../config/uploadFile');
const multer = require('multer');

const uploadImage = function (field, type = 'single') {
  return async (req, res, next) => {
    try {
      if (type === 'single') {
        upload.single(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the file: ${err}` });
          }
          // Add the file path to the request body under the same field name
          req.body[field] = req.file.path;
          next();
        });
      } else if(type === 'array' ) {
        upload.array(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the file: ${err}` });
          }
          // Add the file paths to the request body under the same field name
          req.body[field] = req.files.map(file => file.path);
          next();
        });
      }else if(type === 'fields') {
        upload.fields(field)(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
          } else if (err) {
            return res.status(500).send({ message: `Could not upload the file: ${err}` });
          }
          // Add the file path to the request body under the same field name
          field.forEach((fieldObj) => {
            const fieldName = fieldObj.name;
            if (req.files[fieldName]) {
              req.body[fieldName] = req.files[fieldName].map(file => file.path);
            }
          });
          next();
        });
      }
    } catch (error) {
      console.log(error);
      console.log('error', req.file);
      return res.status(500).send({
        message: `Could not upload the file: ${req.file.originalname}. ${error}`,
      });
    }
  };
};
module.exports = uploadImage;
