require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { generateNewsletter } = require("../src/utils/newsletter");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function (event, context, callback) {
  const newsletter = await generateNewsletter();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: newsletter,
  };
};
