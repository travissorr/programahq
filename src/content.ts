/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                    SITE CONTENT — EDIT HERE                        ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                    ║
 * ║  This is the SINGLE file you need to edit for all site content.    ║
 * ║  Landing page cards, page titles, sections, images, buttons —      ║
 * ║  it's all here.                                                    ║
 * ║                                                                    ║
 * ║  QUICK GUIDE:                                                      ║
 * ║  • Edit a landing card  → update an object in `CARDS` below        ║
 * ║  • Add a landing card   → add an object to `CARDS`                 ║
 * ║  • Edit a page section  → update an object in the page's `sections`║
 * ║  • Add a section        → add an object to the page's `sections`   ║
 * ║  • Add carousel images  → set `images: ["url1", "url2", ...]`      ║
 * ║  • Add a button         → set `buttonUrl` (+ optional buttonLabel) ║
 * ║  • Hide a button        → remove or omit `buttonUrl`               ║
 * ║                                                                    ║
 * ║  ADDING A NEW PAGE:                                                ║
 * ║  1. Add a new entry to `PAGES` below (copy an existing one)        ║
 * ║  2. Add a card to `CARDS` with a matching `path`                   ║
 * ║  3. Add a route in src/app/routes.ts                               ║
 * ║  4. Create a page file in src/app/pages/ (copy Brands.tsx)         ║
 * ║                                                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import imgCompany from "figma:asset/Company_ImageBlur_01.jpg";
import imgDesigner from "figma:asset/Designer_ImageBlur_01.jpg";
import imgBrand from "figma:asset/Brand_ImageBlur_01.jpg";

// ─── Types ───────────────────────────────────────────────────────────

export interface Section {
  /** Bold heading displayed above the section */
  heading: string;
  /** Smaller bold line below the heading */
  byline: string;
  /** Body text. Use \n\n to separate paragraphs. */
  description: string;
  /** Optional URL — shows a yellow button. Omit to hide the button entirely. */
  buttonUrl?: string;
  /** Button text. Defaults to "Open Prototype" if omitted. */
  buttonLabel?: string;
  /** Array of image URLs for the carousel. Uses grey placeholder if omitted. */
  images?: string[];
}

export interface LandingCard {
  /** Card title shown over the image */
  title: string;
  /** Short description shown below the title */
  description: string;
  /** Background image URL (Unsplash, local asset, etc.) */
  image: string;
  /** Route path — must match a route in routes.ts */
  path: string;
}

export interface PageContent {
  /** Large heading at the top of the page */
  title: string;
  /** Array of content sections shown on the page */
  sections: Section[];
}

// ─── Landing Page Cards ──────────────────────────────────────────────

export const CARDS: LandingCard[] = [
  {
    title: "Company Update",
    description:
      "Organize every room, item, and supplier detail in one place - live, searchable, and always current.",
    image: imgCompany,
    path: "/company-update",
  },
  {
    title: "Designers",
    description:
      "Organize every room, item, and supplier detail in one place - live, searchable, and always current.",
    image: imgDesigner,
    path: "/designers",
  },
  {
    title: "Brands",
    description:
      "Organize every room, item, and supplier detail in one place - live, searchable, and always current.",
    image: imgBrand,
    path: "/brands",
  },
];

// ─── Page Content ────────────────────────────────────────────────────

export const PAGES: Record<string, PageContent> = {
  /** /company-update */
  "company-update": {
    title: "Company Update",
    sections: [
      {
        heading: "Section Heading",
        byline: "Section byline",
        description:
          "Programa has entered 2026 with strong momentum. Q4 was our strongest quarter of revenue growth to date, and January built on that again, finishing ahead of plan across subscriber growth, ARR, and overall execution. We closed January at $7.18M ARR, ahead of target, with subscriber growth and acquisition efficiency both outperforming expectations. The business is in a strong position and the operating model is starting to show through in measurable results.\n\nWe have continued to strengthen the team and the organisation is performing at a much higher level than this time last year. Over the past two quarters we have added senior capability across finance, product, marketing, engineering, and customer support, while also improving alignment, accountability, and execution discipline across the company. The team is now set up to move faster, with clearer ownership and a much stronger foundation for scale.\n\nA major driver of this step change has been our transition to becoming AI-native. AI is now embedded into day-to-day delivery across product, engineering, support, and internal workflows. This has materially increased shipping tempo, improved responsiveness to customer feedback, and enabled more quality-of-life improvements and product enhancements to reach users much faster. In January alone, we shipped more than 30 user-facing improvements, and across the first few weeks of the year overall product velocity increased meaningfully. We believe this shift is becoming a structural advantage for Programa, both in speed of execution and output per head.\n\nThat operating leverage is now being directed toward a very ambitious 2026 agenda. Our three headline goals for the year are to reach $20M ARR, reduce designer churn to 3%, and 3x designer seats. Together, these goals reflect the next phase of the company. This is about scaling revenue, deepening product engagement, and improving retention quality at the same time. In practical terms, it means growing from a strong and established workflow platform into a much larger and more embedded operating system for designers and suppliers.",
        buttonUrl: "https://example.com",
        buttonLabel: "Open Prototype",
        // images: ["https://example.com/screenshot1.png", "https://example.com/screenshot2.png"],
      },
      {
        heading: "Section Heading",
        byline: "Section byline",
        description:
          "The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery.",
        buttonUrl: "https://example.com",
        buttonLabel: "Open Prototype",
      },
      {
        heading: "Section Heading",
        byline: "Section byline",
        description:
          "The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery.",
        buttonUrl: "https://example.com",
        buttonLabel: "Open Prototype",
      },
    ],
  },

  /** /designers */
  designers: {
    title: "Designer Roadmap",
    sections: [
      {
        heading: "Section Heading",
        byline: "Section byline",
        description:
          "The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery.",
        buttonUrl: "https://example.com",
        buttonLabel: "Open Prototype",
      },
    ],
  },

  /** /brands */
  brands: {
    title: "Brand Roadmap",
    sections: [
      {
        heading: "Section Heading",
        byline: "Section byline",
        description:
          "The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery. The system that unifies your studio's documentation, decisions, and delivery.",
        buttonUrl: "https://example.com",
        buttonLabel: "Open Prototype",
      },
    ],
  },
};
