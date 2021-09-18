import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote } from "@fortawesome/free-regular-svg-icons";
import {
  faMapMarker,
  faCode,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
const typeToIconMap = {
  slides: faStickyNote,
  event: faMapMarker,
  code: faCode,
  video: faVideo,
};

export default function IconLink({ node: link }) {
  return (
    <span>
      <FontAwesomeIcon
        icon={typeToIconMap[link.type]}
        className="mr-1"
        aria-label={link.text}
        size="2x"
      />
      <a
        href={link.link}
        rel="noopener noreferrer"
        target="_blank"
        className="mr-2"
      >
        {link.type}
      </a>
    </span>
  );
}
