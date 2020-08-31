import React from "react";
import { faStickyNote } from "@fortawesome/free-regular-svg-icons";
import {
  faMapMarker,
  faCode,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default ({ node: { links } }) => {
  const typeToIconMap = {
    slides: faStickyNote,
    event: faMapMarker,
    code: faCode,
    video: faVideo,
  };
  return (
    <div>
      {links &&
        links.map(link => (
          <span key={link._key}>
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
        ))}
    </div>
  );
};
