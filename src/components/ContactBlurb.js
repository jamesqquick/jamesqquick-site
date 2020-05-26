import React from "react";
import Blurb from "./Blurb";
export default function ContactBlurb({ header }) {
  return (
    <Blurb
      buttonText={"Contact Me"}
      buttonLink={"/contact"}
      header={header}
    ></Blurb>
  );
}
