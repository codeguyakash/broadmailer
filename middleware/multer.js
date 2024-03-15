const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    if (!(file?.mimetype === "text/csv")) {
      callBack("only .csv file supported");
      return;
    }
    callBack(null, "./uploads");
  },
  filename: function (req, file, callBack) {
    callBack(null, file.originalname);
  },
});
module.exports.upload = multer({
  storage,
});
