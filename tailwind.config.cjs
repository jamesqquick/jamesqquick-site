/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        youtube: "#eb3223",
        instagram: "#eb3223",
        facebook: "#4968ad",
        twitch: "#644398",
        twitter: "#49a1eb",
        linkedin: "#3077b0",
        brand: "#de5254",
        discord: "#f865f2",
      },
    },
    fontFamily: {
      sans: ["Poppins", "ui-sans-serif", "sans-serif"],
    },
  },
  safelist: [
    "text-youtube",
    "text-instagram",
    "text-facebook",
    "text-twitch",
    "text-twitter",
    "text-linkedin",
  ],
  plugins: [require("@tailwindcss/typography")],
};
