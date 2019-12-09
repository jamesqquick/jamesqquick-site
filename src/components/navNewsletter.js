import React, { Component } from "react";
import "../sass/newsletter.scss";
export default class NavNewsletter extends Component {
  render() {
    return (
      <form id="navNewsletter">
        <input
          type="text"
          name="email"
          id="email"
          placeholder="Newsletter email"
        />
        <button type="submit" className="btn">
          Subscribe
        </button>
      </form>
    );
  }
}
