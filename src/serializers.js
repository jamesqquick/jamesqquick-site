import React from "react";
import Img from "gatsby-image";
import { getFluidGatsbyImage } from "gatsby-source-sanity";
import SyntaxHighlighter from "react-syntax-highlighter";

const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

export default {
  types: {
    code: props => (
      <SyntaxHighlighter language={props.node.language || "text"}>
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
