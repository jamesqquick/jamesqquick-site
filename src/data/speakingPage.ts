export interface SpeakingCtaLink {
  label: string;
  href: string;
}

export const speakingHero = {
  eyebrow: "speaker + educator",
  title: "I use my voice to teach and inspire developers",
  description:
    "From technical keynotes to career growth sessions, I deliver practical talks that leave teams with clear next steps.",
  imageSrc:
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  imageAlt:
    "Placeholder keynote photo. Replace with a speaking stage hero image.",
  primaryCta: {
    label: "Invite me to speak",
    href: "https://example.com/speaking-inquiry",
  },
  secondaryCta: {
    label: "View sample talks",
    href: "https://example.com/talks-playlist",
  },
};

export const speakingStats = [
  { label: "events", value: "100+" },
  { label: "countries", value: "12" },
  { label: "average session rating", value: "4.9/5" },
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
  eyebrow: "featured talk",
  heading: "That keynote",
  youtubeId: "DajdLKD0OmQ",
  watchCta: {
    label: "Watch on YouTube",
    href: "https://www.youtube.com/watch?v=DajdLKD0OmQ",
  },
};

export const speakingAbout = {
  eyebrow: "about",
  heading: "Hi, I'm James Q. Quick",
  description:
    "I am a developer, keynote speaker, and teacher focused on helping developers build confidence and level up their careers through practical guidance.",
  imageSrc:
    "https://images.unsplash.com/photo-1542204625-de293a0f6d22?auto=format&fit=crop&w=900&q=80",
  imageAlt:
    "Placeholder portrait. Replace with James selfie or branding-approved bio photo.",
  readMoreCta: {
    label: "Read full bio",
    href: "https://example.com/about-james",
  },
};

export const speakingGallery = [
  {
    src: "https://images.unsplash.com/photo-1475724017904-b712052c192a?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder conference stage photo 1.",
    href: "https://example.com/gallery/talk-1",
  },
  {
    src: "https://images.unsplash.com/photo-1503424886307-b090341d25d1?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder conference stage photo 2.",
    href: "https://example.com/gallery/talk-2",
  },
  {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder conference audience photo.",
    href: "https://example.com/gallery/talk-3",
  },
  {
    src: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder workshop photo.",
    href: "https://example.com/gallery/talk-4",
  },
];

export const eventCta = {
  heading: "Got a tech event coming up?",
  body: "Let's talk about your audience, goals, and the session format that will make the biggest impact.",
  primaryCta: {
    label: "Book a discovery call",
    href: "https://example.com/book-speaking-call",
  },
};

export const speakerKitLinks: SpeakingCtaLink[] = [
  { label: "Download speaker one-sheet", href: "https://example.com/speaker-kit" },
  { label: "Request private workshop", href: "https://example.com/private-workshop" },
];
