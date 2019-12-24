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
    const isValidEmail = EmailValidator.validate(this.state.email);

    if (isValidEmail) {
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
    }
  };
  render() {
    const blurbHeader = "Sign up for articles, videos, courses, and more!";
    return (
      <div className="blurb">
        <h2 className="blurbHeader">{blurbHeader}</h2>
        <form id="newsletter" onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Newsletter email"
            onChange={e => this.setState({ email: e.target.value })}
            value={this.state.email}
          />
          <button type="submit" className="btn">
            Subscribe
          </button>
        </form>
      </div>
    );
  }
}
