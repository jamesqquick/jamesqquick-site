import React from "react";
import "../sass/footer.scss";
import SocialFollow from "./SocialFollow";

export default function footer() {
  return (
    <footer>
      <div className="footer-content">
        <SocialFollow />
      </div>
    </footer>
  );
}
