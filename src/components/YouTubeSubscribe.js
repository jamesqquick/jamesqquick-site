import React from "react";
import subscribeBtn from "../data/images/youtube-subscribe.svg";
import "../sass/YouTubeSubscribe.scss";
export default function YouTubeSubscribe() {
  return (
    <a
      id="YouTubeSubscribe"
      href="https://www.youtube.com/c/jamesqquick/?sub_confirmation=1"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={subscribeBtn} alt="Subscribe on youtube" />
    </a>
  );
}
