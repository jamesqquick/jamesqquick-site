import React, { useReducer } from "react";
import "../sass/forms.scss";
import * as EmailValidator from "email-validator";
import submitReducer, { SUBMIT_ACTIONS } from "../reducers/SubmitReducer";

// const successMessages = {
//   DEFAULT: "Thanks for SUBMITTING!",
//   // VSCODECHEATSHEET: <a href="https://www.google.com">Here is is</a>,
// };

const initialState = {
  errMsg: "",
  email: "",
  successMsg: "",
  loading: false,
};

export default function NewsletterForm({ giveaway = "DEFAULT", subscribe }) {
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
        const res = await subscribe(email);
        dispatch({ type: SUBMIT_ACTIONS.SUCCESS, msg: res });
      } catch (ex) {
        dispatch({ type: SUBMIT_ACTIONS.ERROR, msg: ex });
      }
    }
  };
  return (
    <>
      {successMsg && <h2 className="h2 text-center">{successMsg}</h2>}
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
