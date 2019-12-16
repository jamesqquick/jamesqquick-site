require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.handler = function(event, context, callback) {
  const { email, name, body } = JSON.parse(event.body);

  const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: "Speaking!",
    text: `${body} \n from ${name}`,
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error(error);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ msg: "Failed to send email." }),
      });
    } else {
      console.log(info);
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({ msg: "Email sent" }),
      });
    }
  });
};
