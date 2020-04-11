import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function talk({ data }) {
  const talk = {
    ...data.sanityTalk,
    slug: data.sanityTalk.slug.current,
    tags: data.sanityTalk.tags.map(tag => tag.title),
  };
  return (
    <Layout>
      <SEO title={talk.title} keywords={[``]} />
      <div className="container ">
        <article className="post">
          <header>
            <h1 className="post--title">{talk.title}</h1>
            <p className="post--date">{talk.publishedDate}</p>
          </header>
          <ul className="post--links">
            {talk.slidesLink && (
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={talk.slidesLink}
                >
                  Slides
                </a>
              </li>
            )}
            {talk.videoLink && (
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={talk.videoLink}
                >
                  Video
                </a>
              </li>
            )}
          </ul>

          <p>{talk.body}</p>
        </article>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query TalkById($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    sanityTalk(_id: { eq: $id }) {
      title
      slug {
        current
      }
      body
      _id
      videoLink
      slidesLink
      conference
      conferenceLink
      publishedDate(formatString: "MM/DD/YYYY")
      tags {
        title
      }
    }
  }
`;
