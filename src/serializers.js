import React from "react";
import Img from "gatsby-image";
import { getFluidGatsbyImage } from "gatsby-source-sanity";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

export default {
  types: {
    code: props => (
      <SyntaxHighlighter
        language={props.node.language || "text"}
        style={atomDark}
        className="pre"
      >
        {props.node.code}
      </SyntaxHighlighter>
    ),
    myAwesomeImage: props => {
      const fluidProps = getFluidGatsbyImage(
        props.node.asset,
        { maxWidth: 1024 },
        sanityConfig
      );
      return <Img fluid={fluidProps} />;
    },
  },
};
