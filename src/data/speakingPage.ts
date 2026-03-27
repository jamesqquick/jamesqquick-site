import type { ImageMetadata } from "astro";
import speakingHeroShiftStage from "../images/speaking/info-bip-shift-23/speaking-hero-stage-1.png";
import speakingHeroWisconsinPortrait from "../images/speaking/that-conf-wisconsin-23/speaking-image-hero.jpg";
import speakingHeroRenderAtl from "../images/speaking/render-23/speaking-hero-renderatl.png";
import speakingHeroAllThingsOpen from "../images/speaking/all-things-open-23/speaking-stage.jpg";
import speakingHeroAuditoriumBw from "../images/speaking/gallery-auditorium-bw.png";
import speakingGalleryStuck from "../images/speaking/that-conference-tx-23/speaking-gallery-stuck.png";
import speakingGalleryWisconsinAlt from "../images/speaking/that-conf-wisconsin-23/speaking-image-04.jpg";
import speakingGalleryStageWalk from "../images/speaking/info-bip-shift-23/speaking-gallery-stage-walk.png";
import speakingGalleryStageCenter from "../images/speaking/info-bip-shift-23/speaking-gallery-stage-center.png";
import speakingGalleryWisconsinStage from "../images/speaking/that-conf-wisconsin-23/speaking-image-05.jpg";
import speakingGalleryWisconsinAudience from "../images/speaking/that-conf-wisconsin-23/speaking-image-02.jpg";

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
      src: speakingHeroShiftStage,
      alt: "James Q Quick speaking on stage with dramatic spotlights and audience in the background.",
      event: "InfoBip Shift",
      location: "Zadar, Croatia",
    },
    {
      src: speakingHeroWisconsinPortrait,
      alt: "James Q Quick speaking on stage in front of a conference audience.",
      event: "THAT Conference",
      location: "Wisconsin Dells, WI",
    },
    {
      src: speakingHeroRenderAtl,
      alt: "James Q Quick presenting on stage at Render ATL.",
      event: "Render ATL",
      location: "Atlanta, GA",
    },
    {
      src: speakingHeroAllThingsOpen,
      alt: "James Q Quick speaking on stage at All Things Open.",
      event: "All Things Open",
      location: "Raleigh, NC",
    },
    {
      src: speakingHeroAuditoriumBw,
      alt: "Black and white photo of James Q Quick speaking from the stage in a large auditorium.",
      event: "Conference Keynote",
      location: "Live Event",
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
    src: speakingGalleryStuck,
    alt: "James Q Quick speaking on stage with a 'Feeling Stuck?!' slide projected behind him.",
    href: "/talks",
  },
  {
    src: speakingGalleryWisconsinAlt,
    alt: "James Q Quick presenting on stage at THAT Conference.",
    href: "/talks",
  },
  {
    src: speakingGalleryStageWalk,
    alt: "James Q Quick walking across the stage while speaking at InfoBip Shift.",
    href: "/talks",
  },
  {
    src: speakingGalleryStageCenter,
    alt: "James Q Quick speaking center stage at InfoBip Shift.",
    href: "/talks",
  },
  {
    src: speakingGalleryWisconsinStage,
    alt: "James Q Quick speaking on stage at THAT Conference.",
    href: "/talks",
  },
  {
    src: speakingGalleryWisconsinAudience,
    alt: "James Q Quick speaking on stage with the audience visible in the foreground.",
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
