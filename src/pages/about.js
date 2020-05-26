import React from "react";
import Layout from "../components/Layout";
import SplitView from "../components/SplitView";
import interviewImage from "../data/images/interview.jpg";
import speakingImage from "../data/images/speaking.jpg";
import teachingImage from "../data/images/teaching.jpg";
import SEO from "../components/SEO";
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

      <section className="section text-center section-light">
        <h1 className="h1 text-center section-title">About</h1>
        <hr className="title-underline" />
        <h3 className="h3 section-subtitle">Developer. Speaker. Teacher.</h3>
        <p className="section-content">
          I’m a Full-Stack Web Developer who is addicted to learning and loves
          working with people. I speak at community events, participate in
          Hackathons, and build continuously.
        </p>

        <SocialFollow size="md" color="dark" />
      </section>
      <SplitView>
        <section className="text-center section ">
          <h1 className="h1 text-center section-title">Developer</h1>
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
        <section className="section text-center section-light">
          <h1 className="h1 text-center section-title">Speaker</h1>
          <hr className="title-underline" />
          <p className="section-content">
            I began my speaking career as a Technical Evangelist at Microsoft
            and have loved it ever since. I’ve spoken and mentored at events
            across the nation and am always looking for new opportunities.
          </p>
        </section>
      </SplitView>
      <SplitView>
        <section className="section text-center ">
          <h1 className="h1 text-center section-title">Teacher</h1>
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
    </Layout>
  );
}
