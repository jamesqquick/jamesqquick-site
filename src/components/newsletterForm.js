import React, { Component } from "react";
import "../sass/newsletter.scss";
import addToMailchimp from "gatsby-plugin-mailchimp";
import * as EmailValidator from "email-validator";
export default class NewsletterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await addToMailchimp(this.state.email);
      if (res.result === "success") {
        this.setState({ email: "" });
      } else if (res.result === "error") {
        //TODO: display error
        console.error(res.msg);
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  render() {
    const isValidEmail = EmailValidator.validate(this.state.email);
    return (
      <form id="newsletter" onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="email"
          id="email"
          placeholder="Newsletter email"
          onChange={e => this.setState({ email: e.target.value })}
          value={this.state.email}
        />
        <button
          type="submit"
          className="btn"
          disabled={!this.state.email || !isValidEmail}
        >
          Subscribe
        </button>
      </form>
    );
  }
}
