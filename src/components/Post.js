import React from "react";
import Share from "./Share";
import ReactMarkdown from "react-markdown";
import Img from "gatsby-image";
import { getFluidGatsbyImage, getFixedGatsbyImage } from "gatsby-source-sanity";
import YouTube from "./YouTube";
const BlockContent = require("@sanity/block-content-to-react");

const sanityConfig = { projectId: "rx426fbd", dataset: "production" };

const serializers = {
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

export default function Post({ post }) {
  //parse all of the links to iterate through and display
  const links = [];
  for (let key of Object.keys(post)) {
    if (post[key] && key.includes("Link")) {
      const index = key.indexOf("Link");
      const linkText = key.substring(0, index);
      links.push({ text: linkText, target: post[key] });
    }
  }

  return (
    <>
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <div className="container">
        <article className="post">
          <header>
            <h1 className="post--title">{post.title}</h1>
            <p className="post--date">{post.publishedDate}</p>
            {post.coverImage && !post.youTubeVideoId && (
              <Img fluid={post.coverImage.asset.fluid} />
            )}
            {post.youTubeVideoId && <YouTube id={post.youTubeVideoId} />}
            {links.length > 0 &&
              links.map((link, index) => (
                <a
                  className="post--link"
                  href={link.target}
                  target="_blank"
                  key={index}
                >
                  {link.text}
                </a>
              ))}
          </header>

          <section>
            {post.mainContent && (
              <BlockContent
                blocks={post.mainContent}
                serializers={serializers}
              />
            )}
            {!post.mainContent && (
              <ReactMarkdown source={post.body} linkTarget="_blank" />
            )}
          </section>
        </article>
      </div>
    </>
  );
}
