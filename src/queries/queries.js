const getBlogQuery = limit => {
  return `allSanityPost(sort: { order: DESC, fields: [publishedDate] }, ${limit &&
    `limit: ${limit}`}) {
      nodes {
        title
        slug {
          current
        }
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
        tags {
          title
        }
      }
    }`;
};

export default { getBlogQuery };
