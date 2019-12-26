import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import Blurb from "../components/Blurb";
export default function teaching() {
  const contactBlurbHeader = "Interested in custom content or training?";
  const coursesBlurbHeader = "Looking for a full list of my courses?";
  return (
    <Layout>
      <SEO
        title="Teaching"
        keywords={[
          `teaching`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">Teaching</h1>
          <hr className="title-underline" />
          <Blurb
            header={coursesBlurbHeader}
            buttonLink="https://www.learnbuildteach.com"
            buttonText="Learn Build Teach"
            isRelativeLink={false}
          />

          <p>
            I've taught <strong>tens of thousands</strong> of students in person
            and online. I've got a passion for Web Development that I want to
            share with you!
          </p>
          <p>I can help you learn...</p>
          <ul>
            <li>
              <strong>HTML</strong>, <strong>CSS</strong>, and{" "}
              <strong>JavaScript</strong>
            </li>
            <li>
              Backend Development with <strong>Nodejs</strong>
            </li>
            <li>
              Frontend Frameworks like <strong>React</strong> and{" "}
              <strong>Angular</strong>
            </li>
            <li>
              <strong>Soft Skills</strong> and{" "}
              <strong>Career Development</strong>
            </li>
          </ul>
          <ContactBlurb header={contactBlurbHeader} />
        </div>
      </section>
    </Layout>
  );
}
