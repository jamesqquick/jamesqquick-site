import React from "react";
import Share from "./Share";
import Img from "gatsby-image";
import YouTube from "./YouTube";
import serializers from "../serializers";
import PodiaNewsletter from "./PodiaNewsletter";
import CourseBuyCard from "./CourseBuyCard";
const BlockContent = require("@sanity/block-content-to-react");

export default function Course({ course }) {
  console.log(course.published);
  return (
    <>
      <Share url={"www.jamesqquick.com/" + course.slug} title={course.title} />
      <article className="post">
        <header className="header">
          <div className="container">
            <h1 className="h1 post--title">{course.title}</h1>
            <p className="post--date">Released: {course.publishedDate}</p>

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
          </div>
        </header>
        {course.courseOverview && (
          <section className="section">
            <div className="container">
              <>
                <h2 className="h2">Course Overview</h2>
                <BlockContent
                  blocks={course.courseOverview}
                  serializers={serializers}
                />
              </>

              {course.published && course.cost && (
                <div className="text-center mt-4">
                  <a href="#courseBuy">
                    <button className="btn">Buy the Course</button>
                  </a>
                </div>
              )}
              {course.externalLink && !course.newsletterSignupURL && (
                <div className="text-center mt-4">
                  <a href={course.externalLink} target="_blank">
                    <button className="btn">Start Learning!</button>
                  </a>
                </div>
              )}
            </div>
          </section>
        )}
        {course.whoIsItFor && (
          <section className="section">
            <div className="container">
              <>
                {" "}
                <h2 className="h2">Who Is It For</h2>
                <BlockContent
                  blocks={course.whoIsItFor}
                  serializers={serializers}
                />
              </>
            </div>
          </section>
        )}
        {course.whatYouGet && (
          <section className="section ">
            <div className="container">
              <>
                {" "}
                <h2 className="h2">What You Get</h2>
                <BlockContent
                  blocks={course.whatYouGet}
                  serializers={serializers}
                />
              </>
            </div>
          </section>
        )}
        {course.faq && (
          <section className="section ">
            <div className="container">
              <>
                {" "}
                <h2 className="h2">FAQ</h2>
                <BlockContent blocks={course.faq} serializers={serializers} />
              </>
            </div>
          </section>
        )}
        {course.courseOutline && (
          <section className="section ">
            <div className="container">
              <>
                {" "}
                <h2 className="h2">Course Outline</h2>
                <BlockContent
                  blocks={course.courseOutline}
                  serializers={serializers}
                />
              </>
            </div>
          </section>
        )}
        {course.published && (
          <section className="section" id="courseBuy">
            <div className="container">
              <CourseBuyCard course={course} />
            </div>
          </section>
        )}
      </article>
    </>
  );
}
