import React from "react";
import "../sass/blurb.scss";
export default function Blurb({
  header,
  buttonText,
  buttonLink,
  btnType,
  isRelativeLink = true,
}) {
  return (
    // <div id="contactBlurb" className="blurb">
    //   <h2 className="blurb-header">{header}</h2>
    //   {isRelativeLink ? (
    //     <Link to={`${buttonLink}`} className={`btn ${btnType}`}>
    //       {buttonText}
    //     </Link>
    //   ) : (
    //     <a href={buttonLink} className={`btn ${btnType}`}>
    //       {buttonText}
    //     </a>
    //   )}
    // </div>
    <></>
  );
}
