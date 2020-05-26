import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Img from "gatsby-image";
import { graphql } from "gatsby";

export default function uses({ data }) {
  return (
    <Layout>
      <SEO
        title="James Q Quick Uses"
        keywords={[
          `James Q Quick Uses`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <header className="header">
        <h1 className="h1 title">What I Use</h1>
        <hr className="title-underline" />
      </header>
      <section className="section">
        <Img fluid={data.file.childImageSharp.fluid} alt="My desk setup" />
        <p>
          I get lots of questions about what kind of hardware, software, desk
          setup, etc. that I use. Well, here ya go!
        </p>
        <h2 className="h2">Software</h2>
        <ul>
          <li>
            <a
              href="https://code.visualstudio.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visual Studio Code
            </a>{" "}
            with the Cobalt 2 theme by Wes Bos
          </li>
          <li>
            <a
              href="https://hyper.is/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hyper Terminal
            </a>
          </li>
          <li>
            <a
              href="https://www.techsmith.com/screen-capture.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Snagit
            </a>{" "}
            for some screenshots and gifs
          </li>
          <li>
            <a
              href="https://www.telestream.net/screenflow/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Screenflow
            </a>{" "}
            for video recording/editing
          </li>
          <li>
            <a
              href="https://trello.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trello
            </a>{" "}
            for tracking my work (like a kanban board)
          </li>
          <li>
            <a
              href="https://www.figma.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Figma
            </a>{" "}
            and{" "}
            <a
              href="https://www.sketch.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sketch
            </a>{" "}
            for design
          </li>
          <li>
            <a
              href="https://github.com/tonsky/FiraCode"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fira Code Font
            </a>
            - it's free!
          </li>
        </ul>
        <h2 className="h2">Hardware/Recording Equipment</h2>
        <ul>
          <li>2018 15 Inch Macbook Pro - 16gb ram, 500gb ssd</li>
          <li>
            <a href="https://www.fully.com/design/jarvis-adjustable-height-desk-laminate.html">
              Adjustable desk from Fully (72 x 30)
            </a>
          </li>
          <li>
            <a
              href="https://www.amazon.com/Shure-SM7B-Cardioid-Dynamic-Microphone/dp/B0002E4Z8M"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shure SM7B Microphone
            </a>
          </li>
          <li>
            <a
              href="https://www.elgato.com/en/gaming/key-light"
              target="_blank"
              rel="noopener noreferrer"
            >
              El Gato Key Lights (2x)
            </a>
          </li>
          <li>
            <a
              href="https://www.elgato.com/en/gaming/stream-deck"
              target="_blank"
              rel="noopener noreferrer"
            >
              El Gato Stream Deck
            </a>
          </li>
          <li>
            <a
              href="https://www.elgato.com/en/gaming/green-screen-mt"
              target="_blank"
              rel="noopener noreferrer"
            >
              El Gato Green Screen
            </a>
          </li>
          <li>
            <a
              href="https://www.amazon.com/PSA-Swivel-Mount-Studio-Microphone/dp/B001D7UYBO"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rode Swivel Boom Arm
            </a>
          </li>
          <li>
            <a
              href="https://www.amazon.com/Logitech-Widescreen-Calling-Recording-Desktop/dp/B006JH8T3S"
              target="_blank"
              rel="noopener noreferrer"
            >
              Logitech C920 Webcam
            </a>
          </li>
          <li>
            <a
              href="https://www.amazon.com/Canon-Mirrorless-Camera-EF-M15-45mm-Video/dp/B079Y45KTJ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canon M50 Camera
            </a>
          </li>
        </ul>
      </section>
    </Layout>
  );
}

export const query = graphql`
  query {
    file(relativePath: { eq: "images/desk_setup.JPG" }) {
      childImageSharp {
        fluid(maxWidth: 700) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;
