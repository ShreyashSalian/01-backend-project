import multer from "multer";
import fs from "fs";
import path from "path";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationDir = "./public/temp";

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

  export const upload = multer({storage: storage, })



  