import Card from "../components/Card";
import React from "react";

export default function CardList({ cards }) {
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
      {cards && (
        <ul className="post-list">
          {cards.map(card => (
            <Card
              title={card.title}
              details={card.publishedDate}
              description={card.excerpt}
              link={card.slug}
              isLinkLocal={true}
              key={card._id}
              coverImage={card.coverImage}
            >
              {card.tags && card.tags.length > 0 && displayTags(card.tags)}
              {card.conference && (
                <p>
                  Event -
                  <a
                    href={card.conferenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {card.conference}
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
