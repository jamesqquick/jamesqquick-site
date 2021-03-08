require("dotenv").config();
const blocksToHTML = require("@sanity/block-content-to-html");
const h = blocksToHTML.h; //h is used to build HTML known as hyprescript
const imageUrlBuilder = require("@sanity/image-url");
const prefixPath = require("./src/utils/prefixPath");

const isProd = process.env.CONTEXT === "production";
const isDev = process.env.NODE_ENV === "development";

const sanityConfig = {
  projectId: "rx426fbd",
  dataset: "production",
};
const builder = imageUrlBuilder(sanityConfig);
const imageUrlFor = source => builder.image(source);

module.exports = {
  siteMetadata: {
    title: `James Q Quick`,
    description: `Personal site for James Q. Quick, Developer, Speaker, and Teacher.`,
    keywords: [
      "James Q Quick",
      "jamesqquick",
      "James Quick",
      "JavaScript",
      "React",
      "Web Development",
      "JAMStack",
    ],
    author: `@jamesqquick`,
    siteUrl: `https://www.jamesqquick.com`,
    twitterHandle: "@jamesqquick",
    url: `https://www.jamesqquick.com`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-json`,
    `gatsby-plugin-twitter`,

    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "data",
        path: `./src/data/`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/data/images/logo-256.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`poppins\:300,400,700,800`],
      },
    },
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-43331509-2",
        // Puts tracking script in the head instead of the body
        head: false,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allSanityPost = [] } }) => {
              return allSanityPost.edges
                .filter(({ node }) => node.slug)
                .map(({ node }) => {
                  const {
                    title,
                    publishedDate,
                    slug,
                    mainContent,
                    excerpt,
                  } = node;
                  const url =
                    site.siteMetadata.siteUrl +
                    prefixPath("blog", slug.current);
                  const retVal = {
                    title,
                    date: publishedDate,
                    url,
                    description: excerpt,
                    guid: url,
                  };
                  if (mainContent) {
                    retVal["custom_elements"] = [
                      {
                        "content:encoded": {
                          _cdata: blocksToHTML({
                            blocks: mainContent,
                            serializers: {
                              types: {
                                code: ({ node }) =>
                                  h(
                                    "pre",
                                    h(
                                      "code",
                                      { lang: node.language },
                                      node.code
                                    )
                                  ),
                                myAwesomeImage: ({ node }) =>
                                  h("img", {
                                    src: imageUrlFor(node.asset).url(),
                                  }),
                                iconLinksList: props => null,
                                iconLink: props => null,
                                ytVideo: props => null,
                              },
                            },
                          }),
                        },
                      },
                    ];
                  }
                  return retVal;
                });
            },
            query: `{
              allSanityPost(sort: {fields: publishedDate, order: DESC}) {
                edges {
                  node {
                    excerpt
                    mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })                    
                    title
                    publishedDate                
                    slug {
                      current
                    }
                  }
                }
              }
            }
            `,
            output: "/feed.xml",
            title: "James Q Quick",
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-mailchimp",
      options: {
        endpoint:
          "https://jamesqquick.us15.list-manage.com/subscribe/post?u=f01b195e97641478be3ec306a&amp;id=f236f68fc1",
      },
    },
    {
      resolve: "gatsby-source-sanity",
      options: {
        projectId: sanityConfig.projectId,
        dataset: sanityConfig.dataset,
        token: process.env.SANITY_TOKEN,
        watchMode: isDev,
        overlayDrafts: !isProd,
      },
    },
  ],
};
