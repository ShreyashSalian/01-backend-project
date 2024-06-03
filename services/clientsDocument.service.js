const path = require("path");
const multer = require("multer");
const fs = require("fs");
const folderName = "public/assets";
const { documentMap } = require("./config");

// Used for uploading the client document----------------------------
let filePath = path.resolve(__dirname, "../", folderName);
try {
  fs.mkdirSync(filePath, { recursive: true }); // Create the entire folder structure recursively
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw err;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.resolve(filePath + `/${documentMap[file.fieldname]}`)
    );
  },

  filename: function (req, file, cb) {
    let finalName = Date.now() + path.extname(file.originalname);
    let folderCreate = path.resolve(
      __dirname +
      "./../" +
      folderName +
      `/${documentMap[file.fieldname]}`
    );

    try {
      fs.mkdirSync(folderCreate, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    req.body[file.fieldname] = `${documentMap[file.fieldname]
      }/${finalName}`;

    if (!req["fields"]) {
      req["fields"] = [file.fieldname];
    } else {
      req["fields"] = [...req.fields, file.fieldname];
    }

    cb(null, finalName);
  },
});

var upload = multer({ storage: storage });
module.exports = { upload };
