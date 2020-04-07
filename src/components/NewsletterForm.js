import React, { useState } from "react";
import "../sass/forms.scss";
import addToMailchimp from "gatsby-plugin-mailchimp";
import * as EmailValidator from "email-validator";
import ValidatedForm from "./ValidatedForm";

export default function NewsletterForm({ giveaway = "DEFAULT" }) {
  console.log(giveaway);
  const successMessages = {
    DEFAULT: "Thanks for subscribing!",
    // VSCODECHEATSHEET: <a href="https://www.google.com">Here is is</a>,
  };
  const [errMsg, setErrMsg] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const isValidEmail = EmailValidator.validate(email);

    if (!isValidEmail) {
      setErrMsg("Please enter a valid email");
    } else {
      try {
        setLoading(true);
        const res = await addToMailchimp(email);
        setLoading(false);
        if (res.result === "success") {
          setSuccessMsg(
            successMessages[giveaway] || successMessages["DEFAULT"]
          );
        } else if (res.result === "error") {
          //Todo: is there a more specific error message to show
          //"msg":"james.q.quick@gmail.com is already subscribed to list James Q Quick Newsletter.
          const errMsg = "Ooops... newsletter subscribe failed.";
          setErrMsg(errMsg);
        }
      } catch (ex) {
        const errMsg = "Ooops... newsletter subscribe failed.";
        setLoading(false);
        setErrMsg(errMsg);
      }
    }
  };
  return (
    <ValidatedForm
      errMsg={errMsg}
      onSubmit={handleSubmit}
      successMsg={successMsg}
      btnText="Subscribe"
      loading={loading}
    >
      <label className="label" htmlFor="email">
        Email
      </label>
      <input
        type="text"
        name="email"
        id="email"
        placeholder="coolkid@coolkids.com"
        onChange={e => setEmail(e.target.value)}
        value={email}
        className={errMsg ? "error" : ""}
      />
    </ValidatedForm>
  );
}
