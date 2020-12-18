import React from "react";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bounce } from "react-awesome-reveal";
import "../sass/socialFollow.scss";

export default function WatchTwitch() {
  return (
    <div className="social-follow">
      <div className="flex">
        <Bounce>
          <a
            href="https://www.twitch.tv/jamesqquick"
            className={`twitch social flex-center`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Link to Twitch`}
          >
            <h3 style={{ marginRight: "10px" }}>View on Twitch</h3>
            <FontAwesomeIcon
              icon={faTwitch}
              size={"3x"}
              aria-label={`Link to Twitch`}
            />
          </a>
        </Bounce>
      </div>
    </div>
  );
}
