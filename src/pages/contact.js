import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactForm from "../components/ContactForm";
export default function contact() {
  return (
    <Layout>
      <SEO title="Contact" keywords={[`contact`]} />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">CONTACT</h1>
          <hr className="title-underline" />
          <p>
            Interested in having me <strong>speak</strong> at your event?
            Creating and/or <strong>teach</strong> content? Have a suggestion
            for content? Maybe just a general question? Let me know!
          </p>
          <ContactForm />
        </div>
      </section>
    </Layout>
  );
}
