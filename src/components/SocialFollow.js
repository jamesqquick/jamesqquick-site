import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faTwitter,
  faInstagram,
  faTwitch,
} from "@fortawesome/free-brands-svg-icons";
import "../sass/socialFollow.scss";
import { Fade } from "react-awesome-reveal";

export default function SocialFollow({ size, color, includeHandle = true }) {
  const sizesMap = {
    sm: "1x",
    md: "2x",
    lg: "3x",
  };

  return (
    <div className="social-follow">
      {includeHandle && (
        <p className={"social-follow-text text-" + color}>
          @james<strong>q</strong>quick
        </p>
      )}
      <div className="flex">
        <Fade triggerOnce={true}>
          <a
            href="https://www.youtube.com/c/jamesqquick"
            className="youtube social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faYoutube} size={sizesMap[size]} />
          </a>
        </Fade>
        <Fade triggerOnce={true} delay={100}>
          <a
            href="https://www.twitter.com/jamesqquick"
            className="twitter social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitter} size={sizesMap[size]} />
          </a>
        </Fade>
        <Fade triggerOnce={true} delay={200}>
          <a
            href="https://www.instagram.com/jamesqquick"
            className="instagram social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} size={sizesMap[size]} />
          </a>
        </Fade>
        <Fade triggerOnce={true} delay={300}>
          <a
            href="https://www.twitch.tv/jamesqquick"
            className="twitch social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitch} size={sizesMap[size]} />
          </a>
        </Fade>

        {/* <a
          href="https://www.linkedin.com/in/jamesqquick/"
          className="linkedin social"
        >
          <FontAwesomeIcon icon={faLinkedin} size={sizesMap[size]} />
        </a> */}
      </div>
    </div>
  );
}
