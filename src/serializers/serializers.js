import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import iconLinksList from "./iconLinksList.js";
import iconLink from "./iconLink.js";
import YouTube from "../components/YouTube.js";
import getYouTubeID from "get-youtube-id";

const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

const config = {
  types: {
    code: (props) => {
      return (
        <SyntaxHighlighter
          language={props.node.language || "text"}
          style={atomDark}
          className="pre"
        >
          {props.node.code}
        </SyntaxHighlighter>
      );
    },
    myAwesomeImage: (props) => {
      const { alt } = props.node;
      const { extension, url, _id } = props.node.asset;
      if (extension === "gif") {
        return <img src={url} alt={alt} />;
      }
      const imageData = getGatsbyImageData(
        _id,
        { maxWidth: 1024 },
        sanityConfig
      );
      return <GatsbyImage image={imageData} alt={alt} />;
    },
    iconLinksList,
    iconLink,
    ytVideo: (props) => <YouTube id={getYouTubeID(props.node.link)} />,
  },
};

export default config;
