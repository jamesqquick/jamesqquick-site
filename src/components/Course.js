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
        <header>
          <div className="container">
            <h1 className="post--title">{course.title}</h1>
            <p className="post--date">Released: {course.publishedDate}</p>

            {course.coverImage && !course.youTubeVideoId && (
              <Img fluid={course.coverImage.asset.fluid} />
            )}
            {course.youTubeVideoId && <YouTube id={course.youTubeVideoId} />}
            {!course.published &&
              course.newsletterSignupURL &&
              course.newsletterMessage && (
                <>
                  <h3>{course.newsletterMessage}</h3>
                  <PodiaNewsletter url={course.newsletterSignupURL} />
                </>
              )}
            {course.externalLink && !course.newsletterSignupURL && (
              <a href={course.externalLink}>
                <h2>Check it out!</h2>
              </a>
            )}
          </div>
        </header>
        <section className="section section-light ">
          <div className="container">
            {course.courseOverview && (
              <>
                {" "}
                <h2>Course Overview</h2>
                <BlockContent
                  blocks={course.courseOverview}
                  serializers={serializers}
                />
              </>
            )}

            {course.published && (
              <div className="text-center">
                <a href="#courseBuy">
                  <button className="btn">Buy the Course</button>
                </a>
              </div>
            )}
          </div>
        </section>
        <section className="section">
          <div className="container">
            {course.whoIsItFor && (
              <>
                {" "}
                <h2>Who Is It For</h2>
                <BlockContent
                  blocks={course.whoIsItFor}
                  serializers={serializers}
                />
              </>
            )}
          </div>
        </section>
        <section className="section section-light">
          <div className="container">
            {course.whatYouGet && (
              <>
                {" "}
                <h2>What You Get</h2>
                <BlockContent
                  blocks={course.whatYouGet}
                  serializers={serializers}
                />
              </>
            )}
          </div>
        </section>
        <section className="section ">
          <div className="container">
            {course.faq && (
              <>
                {" "}
                <h2>FAQ</h2>
                <BlockContent blocks={course.faq} serializers={serializers} />
              </>
            )}
          </div>
        </section>
        <section className="section section-light">
          <div className="container">
            {course.courseOutline && (
              <>
                {" "}
                <h2>Course Outline</h2>
                <BlockContent
                  blocks={course.courseOutline}
                  serializers={serializers}
                />
              </>
            )}
          </div>
        </section>
        <section className="section" id="courseBuy">
          <div className="container">
            <CourseBuyCard course={course} />
          </div>
        </section>
      </article>
    </>
  );
}
