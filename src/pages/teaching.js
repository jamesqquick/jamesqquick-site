import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
export default function teaching() {
  const blurbHeader = "Interested in custom content or training?";
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
          <ContactBlurb header={blurbHeader} />

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
              <strong>Backend Development</strong> with <strong>Nodejs</strong>
            </li>
            <li>
              <strong>Frontend Frameworks</strong> like <strong>React</strong>{" "}
              and <strong>Angular</strong>
            </li>
            <li>
              <strong>Soft Skills</strong> and{" "}
              <strong>Career Development</strong>
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
