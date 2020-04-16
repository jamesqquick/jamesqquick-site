import Card from "../components/Card";
import React from "react";

export default function EventList({ events }) {
  const displayTags = tags => {
    return (
      <small>
        Tags:{" "}
        {tags.map((tag, i) => (
          <small key={i} className="post--tag">
            {tag}
          </small>
        ))}
      </small>
    );
  };
  return (
    <>
      {events && (
        <ul className="post-list">
          {events.map(event => (
            <Card
              title={event.title}
              details={event.publishedDate}
              description={event.excerpt}
              link={event.slug}
              isLinkLocal={true}
              key={event._id}
            >
              {event.tags && event.tags.length > 0 && displayTags(event.tags)}
              {event.conference && (
                <p>
                  Event -
                  <a
                    href={event.conferenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.conference}
                  </a>
                </p>
              )}
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}
