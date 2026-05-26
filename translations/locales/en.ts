export const en = {
  nav: {
    brand: "Humanify.music",
    earlyAccess: "Get Early Access",
  },
  hero: {
    tagline: "Real Music. Real Artists.",
    headline: "Music Made by\nHumans, for Humans",
    subheadline: "The only platform where every track is guaranteed human-made and rated for authenticity — from A (pure) to F (heavily processed).",
    cta: "Join the Waitlist",
    badge: "100% Human-Made Music",
    stats: { artists: "Artists", tracks: "Tracks Rated", human: "Human Made" },
  },
  grading: {
    title: "The Transparency Rating System",
    subtitle: "Every track on Humanify is independently analyzed and graded on our A–F scale — measuring pitch correction, time quantization, and studio processing.",
    grades: [
      { letter: "A", label: "Pure", description: "Zero pitch correction, no time quantization, minimal processing. Raw human performance preserved exactly as performed." },
      { letter: "B", label: "Minimal", description: "Light EQ and natural compression only. Performance feel is fully intact with no corrective processing." },
      { letter: "C", label: "Light", description: "Subtle pitch and timing corrections used sparingly. Human emotion and feel remain clearly present." },
      { letter: "D", label: "Moderate", description: "Noticeable pitch correction and time alignment throughout. Polished but authenticity is partially traded away." },
      { letter: "F", label: "Heavy", description: "Extensive Auto-Tune, heavy quantization, and significant corrective processing. Nearly indistinguishable from AI." },
    ],
  },
  benefits: {
    title: "Why Humanify?",
    subtitle: "We built the platform that music deserved all along.",
    items: [
      { icon: "🎸", title: "Support Real Artists", description: "Every stream directly supports human musicians. Fair pay, transparent royalty splits, and zero algorithmic bias." },
      { icon: "🔍", title: "Transparency You Can Trust", description: "Our independent rating board analyzes every track. No hidden algorithms, no AI smoke and mirrors — just honest music." },
      { icon: "🎵", title: "Discover Pure Sound", description: "Filter by purity grade and find the music that matches your authenticity standards. Human curation, human discovery." },
    ],
  },
  signup: {
    title: "Be First to Experience Humanify",
    subtitle: "Join thousands of music fans who believe in the power of human artistry. Get early access when we launch.",
    namePlaceholder: "Your name (optional)",
    emailPlaceholder: "Enter your email address",
    button: "Join the Waitlist",
    success: "You're on the list! We'll be in touch soon. 🎵",
    alreadyRegistered: "You're already on our waitlist!",
    error: "Something went wrong. Please try again.",
    privacy: "We respect your privacy. Unsubscribe anytime.",
  },
  footer: {
    tagline: "Real Music. Real Artists. Real Transparency.",
    links: { about: "About", blog: "Blog", press: "Press", contact: "Contact", privacy: "Privacy Policy", terms: "Terms of Service" },
    social: "Follow Us",
    rights: "© 2026 Humanify.music. All rights reserved.",
  },
};

export type Translations = typeof en;
