import React from "react";
import "../sass/posts.scss";
import NewsletterForm from "../components/newsletterForm";
export default function talk({ post }) {
  const { id, title, slug, html, publishDate, coverImage, tags } = post;
  return (
    <div className="post">
      <h1>{title}</h1>
      <hr className="title-underline" />
      <h3 className="section-subtitle">
        Sign up for articles, videos, courses, and more!
      </h3>
      <NewsletterForm />
      <hr></hr>

      <p>{publishDate}</p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
