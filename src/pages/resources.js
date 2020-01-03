import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function resources() {
  return (
    <Layout>
      <SEO
        title="Resources"
        keywords={[
          `teaching`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <div className="container">
        <h1 className="title">Resources</h1>
        <hr className="title-underline" />
        <p>
          I'm always sharing resources with people from one off questions. I
          figured it would be worth jotting them all down so that anyone can
          have a quick reference to tons of great content!
        </p>
        <p>
          <strong>Disclaimer</strong> - Some of the links below might be
          affiliate links. However, I have either personally watched/taken all
          of the content listed below or had close friends share very positive
          feedback.
        </p>
        <h2>Paid Courses</h2>
        <h3>JavaScript</h3>
        <ul>
          <li>
            <a href="https://BeginnerJavaScript.com/friend/QUICK">
              Beginner JavaScript by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://ES6.io/friend/QUICK">
              ES6 For Everyone by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/understand-javascript/">
              JavaScript: Understanding the Weird Parts by Anthony Alicea
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/modern-javascript/">
              The Modern JavaScript Bootcamp by Andrew Percival
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/javascript-advanced/">
              Advanced JavaScript by Asim Hussain
            </a>
          </li>
        </ul>
        <h3>React</h3>
        <ul>
          <li>
            <a href="https://AdvancedReact.com/friend/QUICK">
              Advanced React by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://ReactForBeginners.com/friend/QUICK">
              React for Beginners by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/react-the-complete-guide-incl-redux/">
              React - The Complete Guide by Maximilian Schwarzmüller
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/react-2nd-edition/">
              The Complete React Developer Course by Andrew Percival
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/the-complete-react-native-and-redux-course/">
              The Complete React Native Course by Stephen Grider
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/node-with-react-fullstack-web-development/">
              Node with React by Stephen Grider
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/mern-stack-front-to-back/">
              MERN Stack Front To Back by Brad Traversy
            </a>
          </li>
        </ul>
        <h3>Backend</h3>
        <ul>
          <li>
            <a href="https://LearnNode.com/friend/QUICK">
              Learn Node by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/the-complete-nodejs-developer-course-2/">
              The Complete Nodejs Developer Course by Andrew Percival
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/understand-nodejs/">
              Learn and Understand Nodejs by Andrew Alicea
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/nodejs-the-complete-guide/">
              Nodejs the Complete Guide by Maximilian Schwarzmüller
            </a>
          </li>
        </ul>
        <h3>CSS</h3>
        <ul>
          <li>
            <a href="https://www.udemy.com/course/practical-css-grid/">
              Practical CSS Grid by Bryan Robinson
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/modern-html-css-from-the-beginning/">
              Modern HTML and CSS From the Beginning by Brad Traversy
            </a>
          </li>
          <li>
            <a href="https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/">
              CSS The Complete Guide by Maximilian Schwarzmüller
            </a>
          </li>
        </ul>
        <h2>Free Courses</h2>
        <h3>JavaScript</h3>
        <ul>
          <li>
            <a href="https://JavaScript30.com/friend/QUICK">
              JavaScript 30 by Wes Bos
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=W6NZfCO5SIk">
              What is JavaScript by Mosh
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=hdI2bqOjy3c">
              JavaScript Crash Course by Brad Traversy
            </a>
          </li>
        </ul>
        <h3>React</h3>
        <ul>
          <li>
            <a href="https://www.youtube.com/watch?v=sBws8MSXN7A&t=1s">
              Reactjs Crash Course by Brad Traversy
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=Ke90Tje7VS0">
              Reactjs Crash Course by Mosh
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=DLX62G4lc44">
              Learn React JS from Free Code Camp
            </a>
          </li>
        </ul>
        <h3>CSS</h3>
        <ul>
          <li>
            <a href="https://CSSGrid.io/friend/QUICK">CSS Grid by Wes Bos</a>
          </li>
          <li>
            <a href="https://Flexbox.io/friend/QUICK">
              What the Flexbox by Wes Bos
            </a>
          </li>
        </ul>
        <h3>Misc</h3>
        <ul>
          <li>
            <a href="https://CommandLinePowerUser.com/friend/QUICK">
              Command Line Power User by Wes Bos
            </a>
          </li>
        </ul>
        <h2>Premium Subscription Sites</h2>
        <ul>
          <li>
            <a href="https://www.leveluptutorials.com/">
              Level Up Tutorials by Scott Tolinski
            </a>
          </li>
          <li>
            <a href="https://frontendmasters.com/">Frontend Masters</a>
          </li>
          <li>
            <a href="https://egghead.io/">Egg Head</a>
          </li>
        </ul>
        <h2>People To Follow</h2>
        <li>
          <a href="https://twitter.com/wesbos">Wes Bos</a>
        </li>
        <li>
          <a href="https://twitter.com/stolinski">Scott Tolinski</a>
        </li>
        <li>
          <a href="https://twitter.com/laurieontech">Laurie on Tech</a>
        </li>
        <li>
          <a href="https://twitter.com/EmmaBostian">Emma Bostian</a>
        </li>
        <li>
          <a href="https://twitter.com/ASpittel">Ali Spittel</a>
        </li>

        <li>
          <a href="https://twitter.com/jsjoeio">JavaScript/TypeScript Joe</a>
        </li>
        <li>
          <a href="https://twitter.com/brob">Bryan Robinson</a>
        </li>
        <li>
          <a href="https://twitter.com/sarah_edo">Sarah Drasner</a>
        </li>
        <h2>Podcasts to Listen To</h2>
        <ul>
          <li>
            <a href="https://scotch.io/bar-talk/top-10-podcasts-for-web-developers#toc-syntax">
              Syntax by Wes Bos and Scott Tolinski
            </a>
          </li>
          <li>
            <a href="https://blog.codepen.io/radio/">Code Pen Radio</a>
          </li>
          <li>
            <a href="http://www.fullstackradio.com/">Full Stack Radio</a>
          </li>
          <li>
            <a href="https://shoptalkshow.com/">Shop Talk Radio</a>
          </li>
          <li>
            <a href="https://devchat.tv/js-jabber/">JavaScript Jabber</a>
          </li>
          <li>
            <a href="https://reactpodcast.simplecast.fm/">React Podcast</a>
          </li>
          <li>
            <a href="https://www.codenewbie.org/podcast">Code Newbie</a>
          </li>
          <li>
            <a href="https://frontendhappyhour.com/">Front End Happy Hour</a>
          </li>
        </ul>
      </div>
    </Layout>
  );
}
