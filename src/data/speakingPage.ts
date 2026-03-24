import type { ImageMetadata } from "astro";
import galleryStageCloseup from "../images/speaking/gallery-stage-closeup.png";
import galleryAuditoriumBw from "../images/speaking/gallery-auditorium-bw.png";
import galleryStagePinkShirt from "../images/speaking/gallery-stage-pink-shirt.png";
import galleryStageWidePinkShirt from "../images/speaking/gallery-stage-wide-pink-shirt.png";
import galleryThatCampStage from "../images/speaking/gallery-that-camp-stage.png";
import galleryThatProductionWide from "../images/speaking/gallery-that-production-wide.png";
import speakingHeroImage from "../images/speaking/speaking.jpg";
import speakingAtoImage from "../images/speaking/ato.png";
import speakingShiftImage from "../images/speaking/shift.png";

export interface SpeakingCtaLink {
  label: string;
  href: string;
}

export interface SpeakingHeroImage {
  src: string;
  alt: string;
  /** Conference or event name shown under the hero carousel */
  event: string;
  /** City / region shown under the event name */
  location: string;
}

export interface SpeakingGalleryItem {
  src: ImageMetadata;
  alt: string;
  href: string;
}

export const speakingHero = {
  eyebrow: "Speaking",
  title: "I teach and inspire developers",
  images: [
    {
      src: speakingHeroImage,
      alt: "James Q Quick speaking at All Things Open on stage.",
      event: "All Things Open",
      location: "Raleigh, NC",
    },
    {
      src: galleryStagePinkShirt,
      alt: "James Q Quick presenting on stage in a pink shirt.",
      event: "InfoBip Shift",
      location: "Zadar, Croatia",
    },
    {
      src: galleryThatCampStage,
      alt: "James speaking at THAT Conference on a camp-themed stage.",
      event: "THAT Conference 2023",
      location: "Austin, TX",
    },
  ] as SpeakingHeroImage[],
  primaryCta: {
    label: "Invite me to speak",
    href: "#speakerForm",
  },
  secondaryCta: {
    label: "Check out my talks",
    href: "#favorite-talks",
  },
};

export interface SpeakingStat {
  title: string;
  description: string;
  /** astro-icon name, e.g. mdi:star-outline */
  icon: string;
}

export const speakingStats: SpeakingStat[] = [
  {
    title: "Personal Brand",
    description:
      "Building a unique online presence that reflects your values and expertise as a web developer",
    icon: "mdi:star-outline",
  },
  {
    title: "Career Advice",
    description:
      "Practical tips and insights for navigating the web development industry and advancing your career",
    icon: "mdi:chart-bar",
  },
  {
    title: "Modern Web Development",
    description:
      "Exploring the latest trends, tools, and techniques shaping the future of web development.",
    icon: "mdi:monitor",
  },
];

export const speakingTopics = [
  {
    title: "Career Growth",
    description:
      "Actionable advice for developers navigating growth, confidence, and long-term impact.",
  },
  {
    title: "Developer Experience",
    description:
      "How product, docs, and tooling choices can remove friction and create happy developers.",
  },
  {
    title: "Modern Web Development",
    description:
      "Framework-agnostic strategies for building faster, more resilient web apps.",
  },
];

export const featuredTalk = {
  eyebrow: "favorite talks",
  heading: "Favorite talks",
  subtext:
    "From keynote speeches to virtual talks, I always leave developers inspired to be the best version of themselves.",
  talks: [
    {
      title: "That Conference Keynote",
      youtubeId: "DajdLKD0OmQ",
      href: "https://www.youtube.com/watch?v=DajdLKD0OmQ",
      month: "October",
      year: 2023,
    },
    {
      title: "Build Better Developer Experience",
      youtubeId: "M2x9f4A6R1M",
      href: "https://www.youtube.com/watch?v=M2x9f4A6R1M",
      month: "March",
      year: 2024,
    },
    {
      title: "Career Growth for Developers",
      youtubeId: "6T-L_WM6M3k",
      href: "https://www.youtube.com/watch?v=6T-L_WM6M3k",
      month: "September",
      year: 2024,
    },
    {
      title: "Shipping with Modern Web Tools",
      youtubeId: "r3LQxU9I8VU",
      href: "https://www.youtube.com/watch?v=r3LQxU9I8VU",
      month: "May",
      year: 2025,
    },
  ],
};

export const speakingAbout = {
  eyebrow: "about me",
  heading: "Hi, I'm James Q. Quick",
  description:
    "I'm a developer, keynote speaker, and teacher who has spent more than a decade helping developers grow their confidence, sharpen their skills, and build meaningful careers.",
  imageSrc: "/images/selfie-lg.jpeg",
  imageAlt: "Selfie portrait of James Q Quick.",
  readMoreCta: {
    label: "Read full bio",
    href: "/about",
  },
};

export const speakingGallery: SpeakingGalleryItem[] = [
  {
    src: galleryStageCloseup,
    alt: "James Q Quick speaking on stage in front of a colorful presentation screen.",
    href: "/talks",
  },
  {
    src: galleryAuditoriumBw,
    alt: "Black and white auditorium view of James Q Quick presenting on stage.",
    href: "/talks",
  },
  {
    src: galleryStagePinkShirt,
    alt: "James Q Quick giving a talk on a large stage while wearing a pink shirt.",
    href: "/talks",
  },
  {
    src: galleryStageWidePinkShirt,
    alt: "Wide stage shot of James Q Quick presenting with bright lights behind him.",
    href: "/talks",
  },
  {
    src: galleryThatCampStage,
    alt: "James Q Quick speaking at THAT Conference on a camp-themed stage.",
    href: "/talks",
  },
  {
    src: galleryThatProductionWide,
    alt: "Production view of James Q Quick speaking at THAT Conference in front of a large audience.",
    href: "/talks",
  },
];

export const eventCta = {
  heading: "Got a tech event coming up?",
  body: "Let's talk about your audience, goals, and the session format that will make the biggest impact.",
  primaryCta: {
    label: "Let's chat",
    href: "#speakerForm",
  },
};

export const speakerKitLinks: SpeakingCtaLink[] = [
  { label: "Download speaker one-sheet", href: "/speaking/rider" },
  { label: "Download intro headshot", href: "/images/selfie-square.jpeg" },
];
