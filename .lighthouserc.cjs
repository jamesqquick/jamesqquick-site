/** @type {import('@lhci/types').LHCI.SharedConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:8787/",
        "http://localhost:8787/blog",
        "http://localhost:8787/blog/10-amazing-vs-code-themes-youve-probably-never-heard-of",
        "http://localhost:8787/courses",
        "http://localhost:8787/course/modern-websites-with-astro",
        "http://localhost:8787/about",
        "http://localhost:8787/speaking",
        "http://localhost:8787/newsletter",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.8 }],
        "categories:best-practices": ["error", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
