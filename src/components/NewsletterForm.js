import React, { useState, useReducer } from "react";
import "../sass/forms.scss";
import addToMailchimp from "gatsby-plugin-mailchimp";
import * as EmailValidator from "email-validator";
import submitReducer, { SUBMIT_ACTIONS } from "../reducers/SubmitReducer";

const successMessages = {
  DEFAULT: "Thanks for SUBMITTING!",
  // VSCODECHEATSHEET: <a href="https://www.google.com">Here is is</a>,
};

const initialState = {
  errMsg: "",
  email: "",
  successMsg: "",
  loading: false,
};

const FAILED_SUBSCRIBE_MESSAGE = "Ooops... newsletter subscribe failed.";

export default function NewsletterForm({ giveaway = "DEFAULT" }) {
  const [state, dispatch] = useReducer(submitReducer, initialState);
  const { errMsg, email, successMsg, loading } = state;

  const handleSubmit = async e => {
    e.preventDefault();
    const isValidEmail = EmailValidator.validate(email);

    if (!isValidEmail) {
      dispatch({
        type: SUBMIT_ACTIONS.ERROR,
        msg: "Please enter a valid email",
      });
    } else {
      try {
        dispatch({ type: SUBMIT_ACTIONS.SUBMITTING });
        const res = await addToMailchimp(email);
        if (res.result === "success") {
          const successMsg =
            successMessages[giveaway] || successMessages["DEFAULT"];
          dispatch({ type: SUBMIT_ACTIONS.SUCCESS, msg: successMsg });
        } else if (res.result === "error") {
          let errMsg = FAILED_SUBSCRIBE_MESSAGE;
          if (res.msg.includes("already subscribed")) {
            errMsg = "Looks like you're already subscribed.";
          }
          dispatch({ type: SUBMIT_ACTIONS.ERROR, msg: errMsg });
        }
      } catch (ex) {
        const errMsg = FAILED_SUBSCRIBE_MESSAGE;
        dispatch({ type: SUBMIT_ACTIONS.ERROR, msg: errMsg });
      }
    }
  };
  return (
    <>
      {successMsg && <h2 className="text-center">{successMsg}</h2>}
      {!successMsg && (
        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Enter your email"
            onChange={e =>
              dispatch({
                type: SUBMIT_ACTIONS.FIELD,
                target: "email",
                value: e.target.value,
              })
            }
            value={email}
            className={errMsg ? "error" : ""}
          />
          <button type="submit" className="btn">
            {loading ? <div className="loader" /> : "Subscribe"}
          </button>
          {errMsg && (
            <p className="error">
              <small>{errMsg}</small>
            </p>
          )}
        </form>
      )}
    </>
  );
}
