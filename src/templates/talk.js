import React from "react";
import Layout from "../components/layout";

export default function talk(props) {
  const {
    title,
    description,
    conference,
    imageUrl,
    date,
    slidesLink,
  } = props.talk;
  return (
    <div>
      <h1>{title}</h1>
      <p>
        {conference} - {date}
      </p>
      <a href={slidesLink}>Slides</a>
      <p>{description}</p>
    </div>
  );
}
