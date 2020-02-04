import React, { Component } from "react";
import ValidatedForm from "./ValidatedForm";
import * as EmailValidator from "email-validator";

export default class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      body: "",
      category: "",
      errorMsg: "",
      isValidEmail: null,
      successMsg: "",
      loading: false,
    };
  }

  handleSubmit = async e => {
    e.preventDefault();

    //Valid inputs
    if (!this.props.hideDropdown && !this.state.category) {
      return this.setState({
        errMsg: "Please choose a reason for reaching out",
      });
    }

    if (!this.state.name) {
      return this.setState({
        errMsg: "Please include your name",
      });
    }

    if (!EmailValidator.validate(this.state.email)) {
      return this.setState({
        errMsg: "Please enter a valid email",
      });
    }

    if (!this.state.body) {
      return this.setState({
        errMsg: "Don't forget to share the deets!",
      });
    }

    try {
      this.setState({ loading: true });
      const res = await fetch("/.netlify/functions/contact", {
        method: "post",
        body: JSON.stringify({
          email: this.state.email,
          name: this.state.name,
          body: this.state.body,
          category: this.state.category,
        }),
      });
      const loading = false;
      if (res.status === 200) {
        this.setState({
          successMsg: this.props.successMsg || "Thanks for reaching out!",
          loading,
        });
      } else {
        const errMsg = "Ooops... something went wrong.";
        this.setState({ errMsg, loading });
      }
    } catch (ex) {
      const errMsg = "Ooops... something went wrong.";
      this.setState({ errMsg, loading: false });
    }
  };
  render() {
    return (
      <>
        <ValidatedForm
          errMsg={this.state.errMsg}
          id="contactForm"
          onSubmit={this.handleSubmit}
          successMsg={this.state.successMsg}
          btnText="Submit"
          loading={this.state.loading}
        >
          {!this.props.hideDropdown && (
            <select
              onChange={e => this.setState({ category: e.target.value })}
              value={this.state.category}
              className={
                this.state.errMsg && this.state.errMsg.includes("reason")
                  ? "error"
                  : ""
              }
            >
              <option value="" disabled>
                Reason for reaching out...
              </option>

              <option value="speaking">Speaking</option>
              <option value="teaching">Teaching</option>
              <option value="request">Content Request</option>
              <option value="question">General Question</option>
            </select>
          )}
          <input
            category="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={e => this.setState({ name: e.target.value })}
            value={this.state.name}
            className={
              this.state.errMsg && this.state.errMsg.includes("name")
                ? "error"
                : ""
            }
          />
          <input
            category="text"
            name="email"
            id="email"
            placeholder="Email"
            onChange={e => this.setState({ email: e.target.value })}
            value={this.state.email}
            className={
              this.state.errMsg && this.state.errMsg.includes("email")
                ? "error"
                : ""
            }
          />
          <textarea
            name="body"
            id="body"
            placeholder={
              this.props.textareaPlaceholder ||
              "Please include any relevant details with your request. Dates, times, location, etc."
            }
            onChange={e => this.setState({ body: e.target.value })}
            value={this.state.body}
            rows="10"
            className={
              this.state.errMsg && this.state.errMsg.includes("deets")
                ? "error"
                : ""
            }
          />
        </ValidatedForm>
      </>
    );
  }
}
