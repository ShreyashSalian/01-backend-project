const fs = require("fs");
const path = require("path");

// Used to remove the file from the folder---------------------------
const removeFile = (data,res) => {
  try {
    let filepath = path.resolve(__dirname + "./../public/assets/" + data);
    if (Array.isArray(data)) {
      data.map((images) => {
        const filepath = path.resolve(
          __dirname + "./../public/assets/" + images
        );  

        fs.unlink(filepath, function (error,success) {
          if (error) return error;
          else console.log(err);
        });
      });
    } else {
      // Delete file here if error occurred.
      fs.unlink(filepath, function (error) {
        if (error) return error;
      });
    }
  } catch (error) {
    const responsePayload = {
      status: 0,
      message: null,
      data: null,
      error: error.message,
    };
    return res.status(400).json(responsePayload);
  }
};

module.exports = { removeFile };
