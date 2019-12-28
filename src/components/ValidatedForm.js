import React, { Component } from "react";
import "../sass/newsletter.scss";
export default class ValidatedForm extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <>
        <form id={this.props.id} onSubmit={this.props.onSubmit}>
          {this.props.successMsg ? (
            <p>{this.props.successMsg}</p>
          ) : (
            <>
              {this.props.children}
              <button type="submit" className="btn">
                {this.props.loading ? "..." : this.props.btnText}
              </button>
            </>
          )}
        </form>
        {this.props.errMsg && (
          <p className="error">
            <small>{this.props.errMsg}</small>
          </p>
        )}
      </>
    );
  }
}
