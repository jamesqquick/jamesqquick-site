import React from "react";
import Share from "./Share";
import ReactMarkdown from "react-markdown";
import Img from "gatsby-image";
import YouTube from "./YouTube";
import serializers from "../serializers";
const BlockContent = require("@sanity/block-content-to-react");

export default function Post({ post }) {
  return (
    <>
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <article className="post">
        <header className="header">
          <h1 className="h1 post--title">{post.title}</h1>
          <p className="post--date">{post.publishedDate}</p>

          {post.coverImage && !post.youTubeVideoId && (
            <Img fluid={post.coverImage.asset.fluid} />
          )}
          {post.youTubeVideoId && <YouTube id={post.youTubeVideoId} />}
        </header>

        <section className="section">
          {post.mainContent && (
            <BlockContent blocks={post.mainContent} serializers={serializers} />
          )}
          {!post.mainContent && <ReactMarkdown source={post.body} />}
        </section>
        {post.guestBio && (
          <section className="section">
            <h2>
              {post.guestName} - {post.guestTitle}
              <BlockContent blocks={post.guestBio} serializers={serializers} />
            </h2>
          </section>
        )}
      </article>
    </>
  );
}
