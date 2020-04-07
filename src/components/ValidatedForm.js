import React, { Component } from "react";
export default class ValidatedForm extends Component {
  render() {
    return (
      <>
        <form
          id={this.props.id}
          className="form"
          onSubmit={this.props.onSubmit}
        >
          {this.props.successMsg ? (
            <h2 className="text-center">{this.props.successMsg}</h2>
          ) : (
            <>
              {this.props.children}
              <button type="submit" className="btn">
                {this.props.loading ? (
                  <div className="loader" />
                ) : (
                  this.props.btnText
                )}
              </button>
            </>
          )}
          {!this.loading && !this.props.successMsg && this.props.errMsg && (
            <p className="error">
              <small>{this.props.errMsg}</small>
            </p>
          )}
        </form>
      </>
    );
  }
}
