import React from "react";
import "../sass/footer.scss";
import SocialFollow from "./SocialFollow";

export default function footer() {
  return (
    <footer className="footer text-center">
      <div className="flex-center">
        <SocialFollow size="md" />
      </div>
      <p className="">
        Built with{" "}
        <strong>
          <a
            href="https://www.gatsbyjs.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Gatsby
          </a>
        </strong>
        . Data from{" "}
        <strong>
          <a
            href="https://www.sanity.io/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Sanity.io
          </a>
        </strong>
        . Hosted on{" "}
        <strong>
          <a
            href="https://www.netlify.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Netlify
          </a>
        </strong>
        .
      </p>
    </footer>
  );
}
