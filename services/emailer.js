const nodemailer = require("nodemailer");

// use afterwards SendGrid !!!

const sendEmail = async (email, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SCHUDU_EMAIL_HOST,
      port: 587,
      secureConnection: false,
      auth: {
        user: process.env.SCHUDU_EMAIL_USER,
        pass: process.env.SCHUDU_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SCHUDU_EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
      html: html,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;
