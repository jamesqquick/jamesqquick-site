require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = function(event, context, callback) {
  const { email, name, body, type } = JSON.parse(event.body);

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: email,
    subject: type ? `${type} request` : "Mail from JamesQQuick.com",
    text: `${body} \n from ${name}, ${email}`,
    html: `${body} \n from ${name}, ${email}`,
  };

  sgMail
    .send(msg)
    .then(res => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({ msg: "Email sent" }),
      });
    })
    .catch(err => {
      console.error(err);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ msg: "Failed to send email." }),
      });
    });
};
