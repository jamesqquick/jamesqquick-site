import React, { useReducer } from "react";
import * as EmailValidator from "email-validator";
import submitReducer, { SUBMIT_ACTIONS } from "../reducers/SubmitReducer";

const initialState = {
  errMsg: "",
  email: "",
  name: "",
  body: "",
  successMsg: "",
  loading: false,
};

export default function ContactForm(props) {
  const [state, dispatch] = useReducer(submitReducer, initialState);
  const { errMsg, email, name, body, successMsg, loading } = state;

  const bodyPlaceholder =
    props.textareaPlaceholder ||
    "Please include any relevant details with your request. Dates, times, location, etc.";

  const handleSubmit = async e => {
    e.preventDefault();

    let error;
    if (!name) {
      error = "Please include your name";
    } else if (!EmailValidator.validate(email)) {
      error = "Please enter a valid email";
    } else if (!body) {
      error = "Don't forget to share the deets!";
    }
    if (error) {
      return dispatch({ type: SUBMIT_ACTIONS.ERROR, msg: error });
    }

    try {
      dispatch({ type: SUBMIT_ACTIONS.SUBMITTING });
      const res = await fetch("/.netlify/functions/contact", {
        method: "post",
        body: JSON.stringify({
          email: email,
          name: name,
          body: body,
        }),
      });
      if (res.status === 200) {
        const msg = props.successMsg || "Thanks for reaching out!";
        dispatch({ type: SUBMIT_ACTIONS.SUCCESS, msg });
      } else {
        const msg = "Ooops... something went wrong.";
        dispatch({ type: SUBMIT_ACTIONS.ERROR, msg });
      }
    } catch (ex) {
      const msg = "Ooops... something went wrong.";
      dispatch({ type: SUBMIT_ACTIONS.ERROR, msg });
    }
  };

  return (
    <>
      {successMsg && <h2 className="h2 text-center">{successMsg}</h2>}
      {!successMsg && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={e =>
              dispatch({
                type: SUBMIT_ACTIONS.FIELD,
                target: "name",
                value: e.target.value,
              })
            }
            value={name}
            className={errMsg && errMsg.includes("name") ? "error" : ""}
          />
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Email"
            onChange={e =>
              dispatch({
                type: SUBMIT_ACTIONS.FIELD,
                target: "email",
                value: e.target.value,
              })
            }
            value={email}
            className={errMsg && errMsg.includes("email") ? "error" : ""}
          />
          <textarea
            name="body"
            id="body"
            placeholder={bodyPlaceholder}
            onChange={e =>
              dispatch({
                type: SUBMIT_ACTIONS.FIELD,
                target: "body",
                value: e.target.value,
              })
            }
            value={body}
            rows="10"
            className={errMsg && errMsg.includes("deets") ? "error" : ""}
          />
          <button type="submit" className="btn">
            {loading ? <div className="loader" /> : "Submit"}
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
