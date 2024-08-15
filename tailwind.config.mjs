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
        discord: "#f865f2",
        brand: "#0AFA94",
        bg: "#242845",
        bgDark: "#10121D",
        bgLight: "#363C68",
      },
      backgroundImage: {
        interviewing: "url('/images/overlays/interviewing.png')",
        talking: "url('/images/overlays/talking.png')",
        coding: "url('/images/overlays/coding.png')",
        waiting: "url('/images/overlays/waiting.png')",
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
    "h-[0.5px]",
    "h-[1px]",
    "h-[2px]",
    "h-[4px]",
    "transition-all",
    "bottom-8",
  ],
  plugins: [require("@tailwindcss/typography")],
};
