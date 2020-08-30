import React from "react";
// import Share from "./Share";
import Img from "gatsby-image";
import YouTube from "./YouTube";
import serializers from "../serializers/serializers";
import PodiaNewsletter from "./PodiaNewsletter";
import CourseBuyCard from "./CourseBuyCard";
const BlockContent = require("@sanity/block-content-to-react");
export default function Course({ course, headshot }) {
  return (
    <>
      {/* <Share url={"www.jamesqquick.com/" + course.slug} title={course.title} /> */}
      <article className="post">
        <header className="header">
          <h1 className="h1 post--title">{course.title}</h1>
          {/* <p className="post--date">Released: {course.publishedDate}</p> */}

          {course.coverImage && !course.youTubeVideoId && (
            <Img fluid={course.coverImage.asset.fluid} />
          )}
          {course.youTubeVideoId && <YouTube id={course.youTubeVideoId} />}
          {!course.published &&
            course.newsletterSignupURL &&
            course.newsletterMessage && (
              <>
                <h3 className="h3">{course.newsletterMessage}</h3>
                <PodiaNewsletter url={course.newsletterSignupURL} />
              </>
            )}
        </header>
        {course.courseOverview && (
          <section className="section">
            <h2 className="h2">Course Overview</h2>
            <BlockContent
              blocks={course.courseOverview}
              serializers={serializers}
            />

            {course.published && course.fullCost && (
              <>
                <div className="text-center ">
                  <a href="#courseBuy" className="btn mt-4">
                    Buy the Course
                  </a>
                </div>
              </>
            )}
            {course.externalLink && !course.newsletterSignupURL && (
              <div className="text-center mt-4">
                <a
                  href={course.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btn">Start Learning!</button>
                </a>
              </div>
            )}
          </section>
        )}
        {course.whoIsItFor && (
          <section className="section">
            <h2 className="h2">Who Is It For</h2>
            <BlockContent
              blocks={course.whoIsItFor}
              serializers={serializers}
            />
          </section>
        )}
        {course.whatYouGet && (
          <section className="section ">
            <>
              {" "}
              <h2 className="h2">What You Get</h2>
              <BlockContent
                blocks={course.whatYouGet}
                serializers={serializers}
              />
            </>
          </section>
        )}
        {course.faq && (
          <section className="section ">
            <h2 className="h2">FAQ</h2>
            <BlockContent blocks={course.faq} serializers={serializers} />
          </section>
        )}
        {course.courseOutline && (
          <section className="section ">
            <h2 className="h2">Course Outline</h2>
            <BlockContent
              blocks={course.courseOutline}
              serializers={serializers}
            />
          </section>
        )}

        {course.published && (
          <section className="section" id="courseBuy">
            <CourseBuyCard course={course} />
          </section>
        )}
      </article>
    </>
  );
}
