import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function uses() {
  return (
    <Layout>
      <SEO
        title="Resources"
        keywords={[`Uses`, `web development`, `web design`, `developer tools`]}
      />
      <div className="container">
        <h1 className="title">What I Use</h1>
        <hr className="title-underline" />
        <p>
          I get lots of questions about what kind of hardware, software, desk
          setup, etc. that I use. Well, here ya go!
        </p>
        <h2>Software</h2>
        <ul>
          <li>
            <a href="https://code.visualstudio.com/">Visual Studio Code</a>
          </li>
          <li>
            <a href="https://hyper.is/">Hyper Terminal</a>
          </li>
          <li>
            <a href="https://www.techsmith.com/screen-capture.html">Snagit</a>{" "}
            for some screenshots and gifs
          </li>
          <li>
            <a href="https://www.telestream.net/screenflow/">Screenflow</a> for
            video recording/editing
          </li>
          <li>
            <a href="https://trello.com/">Trello</a> for tracking my work (like
            a kanban board)
          </li>
          <li>
            <a href="https://www.figma.com/">Figma</a> and{" "}
            <a href="https://www.sketch.com/">Sketch</a> for design
          </li>
          <li>
            <a href="https://github.com/tonsky/FiraCode">Fira Code Font</a>-
            it's free!
          </li>
        </ul>
        <h2>Hardware</h2>
        <ul>
          <li>2018 15 Inch Macbook Pro - 16gb ram, 500gb ssd</li>
          <li>adjustable (crank) desk from Ikea</li>
        </ul>
        <h2>Recording Setup</h2>
        <ul>
          <li>
            <a href="https://www.amazon.com/Shure-SM7B-Cardioid-Dynamic-Microphone/dp/B0002E4Z8M">
              Shure SM7B Microphone
            </a>
          </li>
          <li>
            <a href="https://www.amazon.com/PSA-Swivel-Mount-Studio-Microphone/dp/B001D7UYBO">
              Rode Swivel Boom Arm
            </a>
          </li>
          <li>
            <a href="https://www.amazon.com/Logitech-Widescreen-Calling-Recording-Desktop/dp/B006JH8T3S">
              Webcam
            </a>
          </li>
          <li>
            <a href="https://www.amazon.com/Canon-Mirrorless-Camera-EF-M15-45mm-Video/dp/B079Y45KTJ">
              Video Camera
            </a>
          </li>
        </ul>
      </div>
    </Layout>
  );
}
