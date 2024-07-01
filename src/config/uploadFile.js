const multer = require('multer');
const {diskStorage} = require('multer');
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}
// Set storage engine
/**
 * The storage configuration for uploaded files.
 *
 * @type {Object}
 * @property {Function} destination - The function that specifies the destination folder for uploaded files.
 * @property {Function} filename - The function that specifies the uploaded file name.
 */
const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = file.originalname.split('.').slice(0, -1).join('.').replace(/ /g, '-').toLowerCase();
    cb(null, `${fileName}-${Date.now()}.${fileExtension}`); // Specify the uploaded file name
  }
});
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
// Initialize multer
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 }});

module.exports = upload;
