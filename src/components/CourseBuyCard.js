import React from "react";
import serializers from "../serializers/serializers";
import "../sass/buttonCard.scss";
const BlockContent = require("@sanity/block-content-to-react");
export default function CourseBuyCard({ course }) {
  return (
    <div className="buy-card">
      <h4 className="h4">Buy the Course</h4>
      <div className="flex-center">
        <small>$</small>
        <span className="display1">{course.fullCost}</span>
        <span>USD</span>
      </div>
      <BlockContent
        blocks={course.whatYouGet}
        serializers={serializers}
        className="checkbox-list"
      />
      <a
        href={course.purchaseLink}
        rel="noopener noreferrer"
        data-podia-embed="link"
        className="btn"
      >
        BUY NOW
      </a>
    </div>
  );
}
