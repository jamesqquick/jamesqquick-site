import React, { Component } from "react";
import "../sass/newsletter.scss";
export default class NewsletterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      body: "",
    };
  }

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch(".netlify/functions/inviteToSpeak", {
        method: "post",
        body: JSON.stringify({
          email: this.state.email,
          name: this.state.name,
          body: this.state.body,
        }),
      });
      console.log(res);
      if (res.status === 200) {
        this.setState({ email: "", name: "", body: "" });
      } else if (res.result === "error") {
        //TODO: display error
        console.error(res.msg);
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  render() {
    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={e => this.setState({ name: e.target.value })}
            value={this.state.name}
          />
          <input
            type="text"
            name="email"
            id="email"
            placeholder="email"
            onChange={e => this.setState({ email: e.target.value })}
            value={this.state.email}
          />
          <textarea
            name="body"
            id="body"
            placeholder="Where would you like me to speak? Please include dates, times, location, etc."
            onChange={e => this.setState({ body: e.target.value })}
            value={this.state.body}
          />
          <button type="submit" className="btn">
            Send
          </button>
        </form>
      </>
    );
  }
}
