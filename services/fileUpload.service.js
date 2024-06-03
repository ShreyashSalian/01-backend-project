const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import the fs module for file system operations

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationDir = "./public/clients";

    // Check if the "invoice" folder exists, and create it if not
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true }); // Create the folder recursively
    }

    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

module.exports = { upload };