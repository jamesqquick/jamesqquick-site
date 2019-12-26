import React, { Component } from "react";
import "../sass/newsletter.scss";
export default class NewsletterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      body: "",
      type: "question",
    };
  }

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch(".netlify/functions/contact", {
        method: "post",
        body: JSON.stringify({
          email: this.state.email,
          name: this.state.name,
          body: this.state.body,
          type: this.state.type,
        }),
      });
      console.log(res);
      if (res.status === 200) {
        this.setState({ email: "", name: "", body: "", type: "speaking" });
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
          <select
            onChange={e => this.setState({ type: e.target.value })}
            value={this.state.type}
          >
            <option value="speaking">Speaking</option>
            <option value="teaching">Teaching</option>
            <option value="request">Content Request</option>
            <option value="question">General Question</option>
          </select>
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
            placeholder="Please include any relevant details with your request. Dates, times, location, etc."
            onChange={e => this.setState({ body: e.target.value })}
            value={this.state.body}
            rows="10"
          />
          <button type="submit" className="btn">
            Send
          </button>
        </form>
      </>
    );
  }
}
