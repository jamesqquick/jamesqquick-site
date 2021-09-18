import React from "react";
import IconLink from "./iconLink";

const IconLinksList = ({ node: { links } }) => {
  return (
    <div>
      {links && links.map((link) => <IconLink node={link} key={link._key} />)}
    </div>
  );
};
export default IconLinksList;
