const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
require("dotenv").config();
// ---------------------------- Used to create the forgot password mailer--------------------------
const forgotPasswordMailer = async (code, email) => {
  try {
    const url = `${process.env.REACT_APP_BASE_URL}`;
    let transporter = nodemailer.createTransport({
      // host: process.env.EMAIL_HOST,
      host : "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: false,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });
    const emailTemplateSource = fs.readFileSync(
      "./views/mails/resetPassword.hbs",
      "utf8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      urlorcode: `${url}/${code}`,
    });
    let info = await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: `${email}`,
      subject: `Reset your password`,
      text: "Reset password",
      html: htmlToSend,
    });
    // console.log("info--------------------------", info);
    // console.log("Message sent: %s************************", info.messageId);
    console.log(
      "Preview URL: %s-------------------",
      nodemailer.getTestMessageUrl(info)
    );
  } catch (err) {
    console.error("err", err);
  }
};

module.exports = { forgotPasswordMailer };
