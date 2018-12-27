import React, { Component } from "react";

export class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      content: "",
      errorMsg: null
    };
  }

  render() {
    const { name, email, content, errorMsg } = this.state;
    const disabled = !name || !email || !content;
    return (
      <div>
        <form className="newsletter" onSubmit={this.onSubmitClick}>
          <div className="inline-form-input">
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={this.onInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={this.onInputChange}
            />
            <textarea
              placeholder="What's Up?!?!"
              name="content"
              rows="8"
              onChange={this.onInputChange}
            />
            <div className="text-right">
              <button className="btn" disabled={disabled}>
                Submit
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

  onSubmitClick = e => {
    e.preventDefault();
  };
}
