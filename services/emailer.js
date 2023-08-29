const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (email, subject, text, html) => {
  const msg = {
    to: email,
    from: "no-reply@schudu.com",
    subject,
    text,
    html: html || "<p>hi</p>",
  };
  console.log(msg);
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log("Email not sent");
      console.error(error);
    });
};

module.exports = sendEmail;
