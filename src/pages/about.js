import React from "react";
import Layout from "../components/layout";
import SplitView from "../components/splitView";
import interviewImage from "../images/interview.jpg";
import speakingImage from "../images/speaking.jpg";
import teachingImage from "../images/teaching.jpg";
import SEO from "../components/seo";
import SocialFollow from "../components/SocialFollow";

export default function about() {
  return (
    <Layout>
      <SEO
        title="Home"
        keywords={[
          `web development`,
          `web design`,
          `developer tools`,
          `James Q Quick`,
        ]}
      />
      <section className="section text-center">
        <h1 className="text-center section-title">James Q Quick</h1>
        <hr className="title-underline" />
        <h3 className="section-subtitle">Developer. Speaker. Teacher.</h3>
        <p className="section-content">
          I’m a Full-Stack Web Developer who is addicted to learning and loves
          working with people. I speak at community events, participate in
          Hackathons, and build continuously.
        </p>

        <SocialFollow size="md" color="dark" />
      </section>
      <SplitView>
        <section className="section section-light text-center section ">
          <h1 className="text-center section-title">Developer</h1>
          <hr className="title-underline" />
          <p className="section-content">
            I started teaching myself Web Development in 2016 through YouTube
            and Udemy. I'm a Full Stack developer focusing on JavaScript
            Frameworks like Angular, React, Node/Express, etc.
          </p>
        </section>
        <img src={interviewImage} alt="" className="img-cover" />
      </SplitView>
      <SplitView>
        <img src={speakingImage} alt="" className="img-cover " />
        <section className="section text-center ">
          <h1 className="text-center section-title">Speaker</h1>
          <hr className="title-underline" />
          <p className="section-content">
            I began my speaking career as a Technical Evangelist at Microsoft
            and have loved it ever since. I’ve spoken and mentored at events
            across the nation and am always looking for new opportunities.
          </p>
        </section>
      </SplitView>
      <SplitView>
        <section className="section text-center section-light">
          <h1 className="text-center section-title">Teacher</h1>
          <hr className="title-underline" />
          <p className="section-content">
            I’ve taught <strong>tens of thousands</strong> of developers online
            and in person. On top of that, I’ve served as a mentor, panelist,
            and guest lecturer. I do all this because I love working with people
            and helping them learn new things.
          </p>
        </section>
        <img
          src={teachingImage}
          alt=""
          className="img-cover object-position-left"
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
      <div className="section section-light">
        <div className="section-content">
          <h1 className="text-center section-title">Contact Me</h1>
          <hr className="title-underline text-center" />
          <p className="text-center">
            Have a question? Suggestion for a topic? Want to share a cool
            project you're working on? Send me a message on twitter at{" "}
            <a href="https://twitter.com/jamesqquick">
              <b>@jamesqquick</b>
            </a>
            !
          </p>
          <br />
        </div>
      </div>
    </Layout>
  );
}
