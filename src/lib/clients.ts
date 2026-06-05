export interface Project {
  slug: string
  title: string
  description: string
  category: string
  color: string
}

export interface Client {
  slug: string
  shortName: string
  name: string
  description: string
  website: string
  logoPath: string
  category: string
  color: string
  projects: Project[]
}

export const clients: Client[] = [
  {
    slug: 'cbhn',
    shortName: 'CBHN',
    name: 'California Black Health Network',
    description:
      'Nonprofit and community health deliverables for Black health equity campaigns, forums, conferences, and fundraising assets.',
    website: 'https://yourcbhn.org/',
    logoPath: 'clients/cbhn/assets/images/cbhn-logo.png',
    category: 'Health equity nonprofit',
    color: 'from-deep-blue to-shamrock',
    projects: [
      {
        slug: 'sponsorship-package',
        title: 'Sponsorship Package',
        description:
          'Virtual Behavioral Health Conference, 9-page sponsorship deck with tiers, speakers, agenda, and commitment form.',
        category: 'Conference, May 2026',
        color: 'from-deep-blue to-shamrock',
      },
      {
        slug: 'registration-flyer',
        title: 'Registration Flyer',
        description:
          'Single-page conference registration flyer with speaker lineup, event details, and QR code.',
        category: 'Conference, May 2026',
        color: 'from-molten-orange to-gold',
      },
      {
        slug: 'zoom-landing-page',
        title: 'Zoom Landing Page',
        description: '1920x1080 Zoom waiting room / landing page graphic for the conference.',
        category: 'Conference, May 2026',
        color: 'from-deep-blue to-molten-orange',
      },
      {
        slug: 'hidden-crises-zoom-background',
        title: 'Hidden Crises, Zoom Background',
        description:
          '1920x1080 speaker Zoom background with a clean center field, CBHN logo, and conference name.',
        category: 'Conference, May 2026',
        color: 'from-deep-blue to-sky',
      },
      {
        slug: 'may-sponsorship-social',
        title: 'May Conference, Sponsorship Social Graphic',
        description:
          '1080x1350 sponsorship opportunities social media graphic with QR CTA and sponsor-value highlights.',
        category: 'Conference, May 2026',
        color: 'from-molten-orange to-deep-blue',
      },
      {
        slug: 'conference-video-slides',
        title: 'Conference Video Slides, Opening + Closing',
        description:
          '8-slide 1920x1080 video-ready sequence with agenda, speakers, QR codes, committee thanks, and sponsor slides.',
        category: 'Conference, May 2026',
        color: 'from-shamrock to-deep-blue',
      },
      {
        slug: 'ceu-certificate-templates',
        title: 'CEU Certificate Templates',
        description:
          'Editable certificate templates for CEU recipients and attendance-only participants, with HTML/PDF-ready source and PPTX handoff.',
        category: 'Conference, May 2026',
        color: 'from-deep-blue to-gold',
      },
      {
        slug: 'hr1-event-flyer',
        title: 'HR1 Forum, Event Flyer',
        description:
          'A4 print and digital flyer for the March 26 Health Equity Forum: Navigating HR1.',
        category: 'Forum, March 2026',
        color: 'from-deep-blue to-shamrock',
      },
      {
        slug: 'hr1-social-graphics',
        title: 'HR1 Forum, Social Graphics',
        description:
          '4 social media graphics sized for LinkedIn, Facebook, and Instagram: speaker spotlight, announcement, teaser, and reminder.',
        category: 'Forum, March 2026',
        color: 'from-shamrock to-gold',
      },
    ],
  },
  {
    slug: 'rxvp',
    shortName: 'RXVP',
    name: 'RxVP',
    description:
      'Life sciences speaker-bureau and leadership programming assets, including partnership and event-promotion pages.',
    website: 'https://www.rxvp.org/',
    logoPath: 'clients/rxvp/assets/images/rxvp-logo.png',
    category: 'Life sciences leadership',
    color: 'from-purple-700 to-amber-500',
    projects: [
      {
        slug: 'partnership-package',
        title: '2026 Partnership Package',
        description:
          'A4 one-page partnership package for RXVP 2026 global virtual panel programming.',
        category: 'Partnership, 2026',
        color: 'from-purple-700 to-amber-500',
      },
      {
        slug: 'international-womens-day',
        title: "International Women's Day Section",
        description:
          "Long-form event recap section for the global International Women's Day leadership program.",
        category: 'Event recap, 2026',
        color: 'from-fuchsia-800 to-amber-500',
      },
      {
        slug: 'ignite-collateral',
        title: 'IGNITE Program Collateral',
        description:
          'Two-page PDF-ready collateral for the RxVP IGNITE public speaking and executive presence coaching program.',
        category: 'Public Speaking',
        color: 'from-purple-800 to-amber-500',
      },
      {
        slug: 'panel-series-package',
        title: 'Panel Series Partnership Package',
        description:
          'Three-page PDF-ready package for the Celebration Days and Emerging Markets virtual panel series.',
        category: 'Partnership, 2026-2027',
        color: 'from-fuchsia-800 to-teal-600',
      },
      {
        slug: 'pride-panel-invites',
        title: 'Pride Panel Invites, Europe & India',
        description:
          'Two-page invite kit for the June 2026 Pride ERG panels: a switchable Europe partner version (Sandoz, Fortrea, IQVIA, Novartis, or RxVP-only) and an India edition.',
        category: 'Pride Month, June 2026',
        color: 'from-purple-700 to-rose-500',
      },
      {
        slug: 'zs-management-skills-checklist',
        title: 'ZS Management Skills Checklist',
        description:
          'One-page manager checklist for the ZS Associates India Emerging Leaders program, branded with RxVP and ZS logos.',
        category: 'Emerging Leaders, 2026',
        color: 'from-purple-800 to-blue-600',
      },
      {
        slug: 'zs-emerging-leaders-training-program',
        title: 'ZS Emerging Leaders Training Program',
        description:
          'Two-page proposal and month-by-month roadmap for the ZS Associates India Emerging Leaders training program.',
        category: 'Training Proposal, 2026-2027',
        color: 'from-blue-700 to-amber-500',
      },
    ],
  },
]

export function getClient(slug: string | undefined): Client | undefined {
  return clients.find((client) => client.slug === slug)
}

export function getProject(clientSlug: string | undefined, projectSlug: string | undefined): Project | undefined {
  return getClient(clientSlug)?.projects.find((project) => project.slug === projectSlug)
}

export function getTotalProjectCount(): number {
  return clients.reduce((total, client) => total + client.projects.length, 0)
}
