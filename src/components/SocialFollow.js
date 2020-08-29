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
  const socials = ["youtube", "twitter", "instagram", "twitch"];
  const socialToIconMap = {
    youtube: { icon: faYoutube, link: "https://www.youtube.com/jamesqquick" },
    twitter: { icon: faTwitter, link: "https://twitter.com/jamesqquick" },
    instagram: { icon: faInstagram, link: "https://instagram.com/jamesqquick" },
    twitch: { icon: faTwitch, link: "https://www.twitch.tv/jamesqquick" },
  };

  return (
    <div className="social-follow">
      {includeHandle && (
        <p className={"social-follow-text text-" + color}>
          @james<strong>q</strong>quick
        </p>
      )}
      <div className="flex">
        {socials.map((social, i) => (
          <Fade triggerOnce={true} key={i}>
            <a
              href={socialToIconMap[social].link}
              className={`${social} social`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Link to ${social}`}
            >
              <FontAwesomeIcon
                icon={socialToIconMap[social].icon}
                size={sizesMap[size]}
                aria-label={`Link to ${social}`}
              />
            </a>
          </Fade>
        ))}
      </div>
    </div>
  );
}
