import React from "react";
import Share from "./Share";
import ReactMarkdown from "react-markdown";
import Img from "gatsby-image";
import YouTube from "./YouTube";
import serializers from "../serializers";
const BlockContent = require("@sanity/block-content-to-react");

export default function Post({ post }) {
  //parse all of the links to iterate through and display
  const links = [];
  for (let key of Object.keys(post)) {
    if (post[key] && key.includes("Link") && !key.includes("external")) {
      const index = key.indexOf("Link");
      const linkText = key.substring(0, index);
      links.push({ text: linkText, target: post[key] });
    }
  }
  console.log(links);

  return (
    <>
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <div className="container">
        <article className="post">
          <header className="header">
            <h1 className="h1 post--title">{post.title}</h1>
            <p className="post--date">{post.publishedDate}</p>

            {post.coverImage && !post.youTubeVideoId && (
              <Img fluid={post.coverImage.asset.fluid} />
            )}
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

            {links.length > 0 &&
              links.map((link, index) => (
                <a
                  className="post--link"
                  href={link.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  {link.text}
                </a>
              ))}
          </header>

          <section className="section">
            {post.mainContent && (
              <BlockContent
                blocks={post.mainContent}
                serializers={serializers}
              />
            )}
            {!post.mainContent && <ReactMarkdown source={post.body} />}
          </section>
        </article>
      </div>
    </>
  );
}
