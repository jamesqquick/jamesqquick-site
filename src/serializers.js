import React from "react";
import Img from "gatsby-image";
import { getFluidGatsbyImage } from "gatsby-source-sanity";
const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

export default {
  types: {
    code: props => (
      <pre data-language={props.node.language}>
        <code>{props.node.code}</code>
      </pre>
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
