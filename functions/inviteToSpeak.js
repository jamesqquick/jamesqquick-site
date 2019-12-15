const axios = require("axios");
require("dotenv").config();

exports.handler = function(event, context, callback) {
  const parsedBody = JSON.parse(event.body);
  console.log(parsedBody);
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: "Email sent" }),
  });
};
