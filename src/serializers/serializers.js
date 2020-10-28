import React from "react";
import Img from "gatsby-image";
import { getFluidGatsbyImage } from "gatsby-source-sanity";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import iconLinksList from "./iconLinksList.js";
import YouTube from "../components/YouTube.js";
import getYouTubeID from "get-youtube-id";

const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

export default {
  types: {
    code: props => {
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
    myAwesomeImage: props => {
      const { extension, url } = props.node.asset;
      if (extension === "gif") {
        return <img src={url} />;
      }
      const fluidProps = getFluidGatsbyImage(
        props.node.asset,
        { maxWidth: 1024 },
        sanityConfig
      );
      return <Img fluid={fluidProps} />;
    },
    iconLinksList,
    iconLink: props => null,
    ytVideo: props => <YouTube id={getYouTubeID(props.node.link)} />,
  },
};
