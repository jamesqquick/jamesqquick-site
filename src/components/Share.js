import React from "react";

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from "react-share";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../sass/share.scss";
export default function Share({ url, title }) {
  return (
    <div className="post-social">
      <FacebookShareButton
        url={url}
        className="button is-outlined is-rounded facebook"
      >
        <span className="icon">
          <FontAwesomeIcon icon={faFacebook} size="3x" />
        </span>
      </FacebookShareButton>
      <TwitterShareButton
        url={url}
        className="button is-outlined is-rounded twitter"
        title={title}
        via={"jamesqquick"}
        // hashtags={tags}
      >
        <span className="icon">
          <FontAwesomeIcon icon={faTwitter} size="3x" />
        </span>
      </TwitterShareButton>
      <LinkedinShareButton
        url={url}
        className="button is-outlined is-rounded linkedin"
        title={title}
      >
        <span className="icon">
          <FontAwesomeIcon icon={faLinkedin} size="3x" />
        </span>
      </LinkedinShareButton>
    </div>
  );
}
