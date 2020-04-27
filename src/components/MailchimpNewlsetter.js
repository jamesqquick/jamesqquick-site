import React from "react";
import NewsletterForm from "./NewsletterForm";
import addToMailchimp from "gatsby-plugin-mailchimp";

export default function MailchimpNewlsetter({ giveaway }) {
  const FAILED_SUBSCRIBE_MESSAGE = "Ooops... newsletter subscribe failed.";

  const subscribe = async email => {
    const res = await addToMailchimp(email);
    if (res.result === "success") {
      return "Thanks for signing up!";
    } else if (res.result === "error") {
      let errMsg = FAILED_SUBSCRIBE_MESSAGE;
      if (res.msg.includes("already subscribed")) {
        errMsg = "Looks like you're already subscribed.";
      }
      throw errMsg;
    }
  };

  return (
    <NewsletterForm subscribe={subscribe} giveaway={giveaway}></NewsletterForm>
  );
}
