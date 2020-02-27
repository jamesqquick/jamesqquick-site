import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactForm from "../components/ContactForm";
export default function contest() {
  return (
    <Layout>
      <SEO title="Contest" keywords={[`contest`]} />
      <div className="container">
        <h1 className="title">Contest</h1>
        <hr className="title-underline" />
        <p>Sorry, there are currently no contests going on</p>
        {/* <p>
          To celebrate completely re-recording my Learn Visual Studio Code
          course on Udemy, I am going to give away{" "}
          <strong>10 FREE COUPONS</strong>.
        </p>
        <p>
          To be eligible, send me a note with what you would be most excited to
          learn about Visual Studio Code!
        </p>
        <ContactForm
          hideDropdown={true}
          textareaPlaceholder="What are you most excited to learn about Visual Studio Code?"
          successMsg="Thank you for participating. I'll announce the winners on February 5th!"
        /> */}
      </div>
    </Layout>
  );
}
