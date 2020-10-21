import React from "react";
import Share from "./Share";
import Img from "gatsby-image";
import YouTube from "./YouTube";
import serializers from "../serializers/serializers";
const BlockContent = require("@sanity/block-content-to-react");

export default function Post({ post, children }) {
  return (
    <>
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <article className="post">
        <header className="header">
          <Img
            fluid={post.coverImage.asset.fluid}
            style={{ marginBottom: "20px" }}
          />
          <h1 className="h1 post--title">{post.title}</h1>
          <p className="post--date">{post.publishedDate}</p>

          {post.youTubeVideoId && <YouTube id={post.youTubeVideoId} />}

          {post.externalLink && (
            <a
              href={post.externalLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <h2 className="h2">Check it out!</h2>
            </a>
          )}

          {children}
        </header>

        {post.mainContent && (
          <section className="section">
            <BlockContent blocks={post.mainContent} serializers={serializers} />
          </section>
        )}
      </article>
    </>
  );
}
