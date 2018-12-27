require("dotenv").config();
const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const adminEmail = process.env.ADMIN_EMAIL;

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass }
});

exports.handler = function(event, context, callback) {
  const { name, email, content } = JSON.parse(event.body);

  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!re.test(email)) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ msg: "Invalid Email" })
    });
  }

  var mailOptions = {
    from: email,
    to: adminEmail,
    subject: "New Message From James Q Quick",
    text: `Message from ${name} \n ${content}`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error(error);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ msg: "Failed to send email" })
      });
    } else {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({ msg: "Thanks for reaching out!" })
      });
    }
  });
};
