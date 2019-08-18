import React from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Layout from "../components/layout";
import SEO from "../components/seo";
import SplitView from "../components/splitView";
import interviewImage from "../images/interview.jpg";
import speakingImage from "../images/speaking.jpg";
import teachingImage from "../images/teaching.jpg";
import SocialFollow from "../components/SocialFollow";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IndexPage = () => (
  <Layout>
    <SEO
      title="Home"
      keywords={[`web development`, `web design`, `developer tools`]}
    />
    {/* <SplitView> */}
    <section className="section text-center section-full-height">
      <h1 className="text-center section-title">James Q Quick</h1>
      <hr className="title-underline" />
      <h3 className="section-subtitle">Developer. Speaker. Teacher.</h3>
      <p className="section-content">
        I’m a Full-Stack Web Developer who is addicted to learning and loves
        working with people. I speak at community events, participate in
        Hackathons, and build continuously.
      </p>
      <p>
        I also create <b>Web Development</b> content at{" "}
        <a href="https://www.learnbuildteach.com">
          <strong>Learn Build Teach</strong>
        </a>
        .
      </p>
      <SocialFollow />
      {/* <button className="btn">
        <b>Learn Build Teach</b>
      </button> */}
      <FontAwesomeIcon
        className="absolute-bottom"
        icon={faAngleDown}
        size="6x"
        fixedWidth
        id="downArrow"
      />
    </section>
    {/* <img src={interviewImage} alt="" className="img-cover full-height" />
    </SplitView> */}
    <SplitView>
      <section className="section section-light text-center section section-full-height">
        <h1 className="text-center section-title">Developer</h1>
        <hr className="title-underline" />
        <p className="section-content">
          I started teaching myself Web Development in 2016 through YouTube and
          Udemy. I'm now a Lead Web Developer and Application Architect focusing
          on JavaScript Frameworks like Angular, React, Node/Express, etc.
        </p>
      </section>
      <img src={interviewImage} alt="" className="img-cover full-vh" />
    </SplitView>
    <SplitView>
      <img src={speakingImage} alt="" className="img-cover full-vh" />
      <section className="section text-center section-full-height">
        <h1 className="text-center section-title">Speaker</h1>
        <hr className="title-underline" />
        <p className="section-content">
          I began my speaking career as a Technical Evangelist at Microsoft and
          have loved it ever since. I’ve spoken and mentored at events across
          the nation and am always looking for new opportunities.
        </p>
      </section>
    </SplitView>
    <SplitView>
      <section className="section text-center section-light section-full-height">
        <h1 className="text-center section-title">Teacher</h1>
        <hr className="title-underline" />
        <p className="section-content">
          I’ve led workshops with custom content for students, startups, and
          professional developers across the country. On top of that, I’ve
          served as a mentor, panelist, and guest lecturer. I do all this
          because I love working with people and helping them learn new things.
        </p>
      </section>
      <img
        src={teachingImage}
        alt=""
        className="img-cover full-vh object-position-left"
      />
    </SplitView>
    <section className="section">
      <div className="section-content">
        <h3 className="section-subtitle text-center">
          Did I mention I run a YouTube Channel?!
        </h3>
        <br />
        <div className="text-center">
          <button className="btn">Check It Out!</button>
        </div>
      </div>
    </section>
    <section className="section section-light">
      <div className="section-content">
        <h1 className="text-center section-title">Contact Me</h1>
        <hr className="title-underline text-center" />
        <p className="text-center">
          I would love to connect with you. Reach out to ask a question, share a
          project, a new tool you love, or just to chat. You can message me on
          twitter at{" "}
          <a href="https://twitter.com/jamesqquick">
            <b>@jamesqquick</b>
          </a>
        </p>
        <br />
        {/* <ContactForm /> */}
      </div>
    </section>
  </Layout>
);

export default IndexPage;
