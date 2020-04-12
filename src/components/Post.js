import React from "react";
import Share from "./Share";
import ReactMarkdown from "react-markdown";
import Img from "gatsby-image";
import YouTube from "./YouTube";
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
            <ReactMarkdown source={post.body} linkTarget="_blank" />
          </section>
        </article>
      </div>
    </>
  );
}
