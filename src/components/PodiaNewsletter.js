import React from "react";
import NewsletterForm from "./NewsletterForm";

export default function PodiaNewsletter({ url }) {
  const FAILED_SUBSCRIBE_MESSAGE = "Ooops... newsletter subscribe failed.";

  const subscribe = async email => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept-Charset": "utf-8",
        },
        body: JSON.stringify({ email, utf8: "✓" }),
      });
      const data = await res.json();
      console.log(data);
      return "Thanks for subscribing";
    } catch (ex) {
      console.log(ex);
      throw FAILED_SUBSCRIBE_MESSAGE;
    }
  };

  return <NewsletterForm subscribe={subscribe} />;
}

{
  /* <form
  action="https://jamesquick.podia.com/email_lists/65003/subscriptions"
  accept-charset="UTF-8"
  method="post"
>
  <input name="utf8" type="hidden" value="✓" />
  <input type="email" name="email" required="required" placeholder="Email" />
  <input type="submit" value="Sign me up!" />
</form>; */
}
