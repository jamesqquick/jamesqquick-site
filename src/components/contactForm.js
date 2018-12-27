import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      content: "",
      errorMsg: null,
      loading: false
    };
  }

  render() {
    const { name, email, content, errorMsg, loading } = this.state;
    const disabled = !name || !email || !content;
    return (
      <div>
        <form
          name="contact"
          method="POST"
          className="newsletter"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          action="/success"
        >
          <div className="inline-form-input">
            <input type="hidden" name="bot-field" />

            <input
              type="text"
              name="name"
              value={name}
              placeholder="Name"
              onChange={this.onInputChange}
            />
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              onChange={this.onInputChange}
            />
            <textarea
              placeholder="What's Up?!?!"
              name="content"
              value={content}
              rows="8"
              onChange={this.onInputChange}
            />
            <div className="text-right">
              <button type="submit" className="btn" disabled={disabled}>
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} size="1x" spin />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
          {!!errorMsg ? <p className="text-danger">{errorMsg}</p> : ""}
        </form>
      </div>
    );
  }

  onInputChange = e => {
    console.log("input change");
    const name = e.target.name;
    const text = e.target.value;
    this.setState({ [name]: text });
  };

  onSubmitClick = async e => {
    e.preventDefault();
    this.setState({ loading: true });

    const { email, name, content } = this.state;
    console.log("submitting some stuff");
    try {
      const response = await fetch("/.netlify/functions/contact", {
        method: "post",
        body: JSON.stringify({ email, name, content })
      });

      var body = await response.json();
      console.log("body", body);
      console.log(response.status);

      if (response.status === 500 || response.status === 400) {
        //TODO: display popup message for failure
        const errorMsg = body.msg;
        console.log(errorMsg);
        this.setState({ errorMsg, loading: false });
      } else {
        //TODO: show popup message for success!
        this.setState(
          { email: "", name: "", content: "", errorMsg: null, loading: false },
          () => {
            console.log(this.state);
          }
        );
      }
    } catch (err) {
      //TODO: display popup message for failure
      this.setState({ errorMsg: "Something went wrong.", loading: false });
      console.log("err", err);
    }
  };
}
