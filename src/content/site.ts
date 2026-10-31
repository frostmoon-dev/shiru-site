/**
 * Every word on the site lives here. Edit this file; no component needs touching.
 *
 * Anything marked `TODO` is placeholder copy written in Teha's voice so the layout reads
 * properly. Replace it before launch. Search the repo for "TODO:" to find all of them.
 */

export const site = {
  name: 'Teha',
  /** Used for the mailto fallback, the contact icons and the footer. */
  email: 'shirubawing@gmail.com',
  locale: 'en',
  title: 'Teha · ERP by day, words by night',
  description:
    'Teha builds Dynamics 365 Finance & Operations systems in X++ by day and wanders into peculiar projects by night. Case No. 0: subject unknown.',
  ogImage: '/og.png',
  ogImageAlt: 'The name TEHA in pale lettering on black, under the line Case No. 0, Subject: unknown.',
} as const;

export type ChapterId = 'rabbit-hole' | 'record' | 'archives' | 'grimoire' | 'tea';

export const chapters: { id: ChapterId; numeral: string; label: string; title: string }[] = [
  { id: 'rabbit-hole', numeral: 'I', label: 'About', title: 'Down the rabbit hole' },
  { id: 'record', numeral: 'II', label: 'Résumé', title: 'On the record' },
  { id: 'archives', numeral: 'III', label: 'Work', title: 'The archives' },
  { id: 'grimoire', numeral: 'IV', label: 'Career', title: 'The grimoire' },
  { id: 'tea', numeral: 'V', label: 'Contact', title: 'Tea at midnight' },
];

export const ui = {
  skip: 'Skip to the story',
  navLabel: 'Chapters',
  menuOpen: 'Open the menu.',
  menuClose: 'Close the menu',
  menuTitle: 'Where to?',
  /** Kicker above each section title (the hero's 'Case No. 0' pattern). */
  caseNo: (numeral: string, label: string) => `Case No. ${numeral} · ${label}`,
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  soundLabel: 'Music',
  close: 'Close',
  backToStory: 'Back to the story',
  loading: 'The ink is still wet…',
  noWebgl: 'This book won’t open here. The pages still read fine.',
};

export const intro = {
  skip: 'Skip intro',
  moonLabel: 'The moon is up.',
  loading: 'Waiting for the moon',
  /** Photos flash past in the intro burst. Replace with real photos (see assets README). */
  frames: [
    { src: 'intro-1', alt: '' },
    { src: 'intro-2', alt: '' },
    { src: 'intro-3', alt: '' },
    { src: 'intro-4', alt: '' },
    { src: 'intro-5', alt: '' },
  ],
};

export const hero = {
  name: 'Teha',
  kicker: 'Case No. 0 · Subject: unknown',
  /** Typed out one line at a time. */
  lines: ['A dreamer.', 'An overthinker.', 'A creator.'],
  /** The last words glitch. */
  tagline: { before: 'I make a living out of things that make sense. The rest ', glitch: 'keeps me awake', after: '.' },
  /** Label above the eye (the menu button) on the hero. */
  navigate: 'Navigate.',
};

export const about = {
  title: 'Down the rabbit hole',
  /** Inside the lace frame. */
  /** Lead under the title. */
  card: 'I build and fix systems to keep everything in balance. Some things, however, refuse to be fixed. Perhaps that is the difference between the sentient and the lifeless.',
  sweet: 'Pinned at midnight. It still moves, sometimes.',
  sweetAlt: 'A pale moth, pinned like a specimen.',
  body: [
    'By day, I work with X++ and Microsoft Dynamics 365 Finance & Operations. I spend my time shaping business logic, extending existing systems, and bringing new functionality into existence. I have a particular fondness for starting with a requirement, following its logic, and turning an idea into something tangible. There’s a certain pleasure in creating order where there was once only possibility.',
    'By night, I tend to wander a little further into my own imagination. I have a habit of collecting interests, entertaining peculiar ideas, and turning passing thoughts into projects. Some become websites, some become experiments, and others remain little fragments of something I haven’t quite figured out yet. I enjoy the process of bringing an idea into existence, even if I occasionally leave a trail of unfinished things behind me.',
  ],
  /** On the black scroll. */
  facts: [
    { term: 'Hours', detail: 'Mostly after dark' },
    { term: 'Curiosities', detail: 'An unreasonable number' },
    { term: 'LinkedIn', detail: 'The professional record', href: 'https://www.linkedin.com/in/fatihahmuhd/' },
  ] as { term: string; detail: string; href?: string }[],
  warning: 'Careful. Looks can deceive.',
};

/**
 * Chapter II: the résumé. Roles and dates follow LinkedIn (newer than the PDF); the PDF is
 * public/media/Nurfatihah-Muhammad-CV.pdf.
 */
export const record = {
  title: 'On the record',
  lead: 'A Microsoft Dynamics 365 Finance & Operations and Business Central technical developer with over four years of experience. X++, SSRS reports and extensions; requirements in, working solutions out.',
  facts: [
    { term: 'Now', detail: 'D365 F&O Associate Developer, LOGISTEED Solutions Asia-Pacific Sdn. Bhd. (Feb 2026 – present)' },
    { term: 'Before', detail: 'COMM-iT Group: Software Developer (Feb 2023 – Apr 2026), Junior Consultant (Feb 2022 – Feb 2023)' },
    { term: 'Certified', detail: 'Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer Associate (June 2023)' },
    { term: 'Studied', detail: 'Bachelor of Electronic Engineering (Computer) with Honours, Universiti Malaysia Sabah (2016 – 2020)' },
    { term: 'Based in', detail: 'Selangor, Malaysia' },
  ],
  skillsLabel: 'Skills',
  skills: [
    'X++',
    'SSRS reports',
    'Forms & data entities',
    'Extensions',
    'Business Central',
    'AL',
    'SQL Server',
    'E-invoicing',
    'Security roles',
    'Solution design',
    'Debugging & code review',
  ],
  pdf: {
    href: '/media/Nurfatihah-Muhammad-CV.pdf',
    filename: 'Nurfatihah-Muhammad-CV.pdf',
    size: 'PDF, 1 page, 2.7 MB',
  },
  download: 'Download the résumé',
  view: 'Or read it in the browser',
  previewAlt: 'The first page of the résumé: Nurfatihah Muhammad, professional summary, skills, experience and education.',
  more: 'The long version is in the grimoire',
};

export type CaseFile = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  photo: 'bond-garden' | 'moonpaper' | 'napyru' | 'moona' | 'fo-task-board' | 'colour-themes';
  photoAlt: string;
  /** Where the square polaroid crop of the (wide) screenshot centres: a CSS object-position. */
  focus?: string;
  rotation: number;
  details: { heading: string; body: string }[];
  stack: string[];
  links?: { href: string; label: string }[];
  /** Shown instead of links when the code isn't public. */
  isPrivate?: boolean;
  /** Fan-work credit line. */
  note?: string;
};

const gh = (repo: string) => ({ label: 'Source on GitHub', href: `https://github.com/frostmoon-dev/${repo}` });

/**
 * Chapter III: side projects. The text comes from Teha's earlier portfolio (frostmoon-dev/my-portfolio,
 * content/projects.ts), where every line was checked against each repo's README and package.json.
 */
export const caseFiles = {
  title: 'The archives',
  intro: 'What I build after hours. Six open investigations; none of them are closed.',
  hint: 'Pick a file. They don’t bite. Mostly.',
  swipeHint: 'Swipe through the files',
  files: [
    {
      slug: 'bond-garden',
      number: 'No. 1',
      title: 'Bond Garden',
      summary: 'A visual-novel chat in the style of Fate/Grand Order: you write your lines, and AI characters answer with dialogue, narration and changing expressions.',
      photo: 'bond-garden',
      photoAlt: 'Bond Garden: a grid of character cards (BB, Castoria, Charlemagne, Ereshkigal) with bond levels and Start buttons.',
      focus: '42% 50%',
      rotation: -2,
      details: [
        {
          heading: 'What it is',
          body: 'A visual-novel chat in the style of Fate/Grand Order. You write your lines, and AI characters answer with dialogue, narration and sprite expression changes.',
        },
        {
          heading: 'Proud of',
          body: 'Works with any OpenAI-compatible API, streamed. The API key is stored encrypted and never reaches the browser. The reply parser, lorebook, prompt builder, summaries and SSE stream all have tests.',
        },
      ],
      stack: ['Next.js 16', 'TypeScript', 'Prisma 7', 'Supabase Postgres', 'Tailwind 4', 'Vitest'],
      links: [gh('fgo-bot-garden')],
      note: 'Fan project. Fate/Grand Order © TYPE-MOON / FGO PROJECT.',
    },
    {
      slug: 'moonpaper',
      number: 'No. 2',
      title: 'MoonPaper',
      summary: 'A roleplay chat site for my own characters, with a layered memory that keeps long stories cheap to continue.',
      photo: 'moonpaper',
      photoAlt: 'MoonPaper: a chat with BB, a purple-haired character, her reply set over a moonlit illustration.',
      focus: '56% 40%',
      rotation: 1.5,
      details: [
        {
          heading: 'What it is',
          body: 'A roleplay chat site for my own characters: bots, lorebooks, personas, image cropping and Character Card V2 import/export.',
        },
        {
          heading: 'Proud of',
          body: 'Layered memory (recent messages, chapters, a story so far, lasting facts and keyword recall), ordered so providers can cache most of each prompt. In a 200-message test chat it cut a reply’s input from about 7,800 to about 2,100 tokens. Everything lives in IndexedDB; no server stores your key.',
        },
      ],
      stack: ['JavaScript', 'IndexedDB', 'Vercel Functions', 'PWA'],
      links: [gh('fgo-lore-site')],
    },
    {
      slug: 'napyru',
      number: 'No. 3',
      title: 'Napyru',
      summary: 'A private messenger PWA for exactly two people, calm and built around the conversation.',
      photo: 'napyru',
      photoAlt: 'Napyru: a two-person chat over a black-and-white drawing, with a sidebar for chat, plans, map, memories and bond.',
      focus: '45% 50%',
      rotation: -1.5,
      details: [
        { heading: 'What it is', body: 'A private messenger PWA for exactly two people, calm and built around the conversation.' },
        {
          heading: 'Proud of',
          body: 'Realtime chat with honest receipts (sent, delivered, read), typing and presence, voice messages with waveforms, reactions, a WhatsApp-style photo tray and push notifications, all behind Supabase row-level security.',
        },
      ],
      stack: ['Next.js 16', 'React 19', 'Supabase', 'Framer Motion', 'Playwright', 'Vitest'],
      links: [gh('messaging-app')],
    },
    {
      slug: 'moona',
      number: 'No. 4',
      title: 'Moona',
      summary: 'A local-first tracker for money, food, weight and work tasks, with BB (Fate/Extra CCC) peeking in to judge every entry.',
      photo: 'moona',
      photoAlt: 'Moona: a home screen greeting “Good evening” beside an illustrated character, with the month’s income, spending and balance below.',
      focus: '62% 30%',
      rotation: 2,
      details: [
        { heading: 'What it is', body: 'A local-first tracker for money, food, weight and work tasks, with BB (Fate/Extra CCC) peeking in to judge every entry.' },
        {
          heading: 'Proud of',
          body: 'The app calculates every number (budgets, calorie targets, pace). The AI never does. Without an API key, BB falls back to her built-in lines, so the app still works.',
        },
      ],
      stack: ['Next.js', 'TypeScript', 'Vitest', 'NVIDIA / OpenRouter API'],
      isPrivate: true,
    },
    {
      slug: 'fo-task-board',
      number: 'No. 5',
      title: 'F&O Task Board',
      summary: 'A Kanban board for my own ERP work: tickets, defects and configs by module, stage and environment.',
      photo: 'fo-task-board',
      photoAlt: 'An illustration of a three-column task board (backlog, testing, done) with cards marked GL, AP, AR and SCM.',
      rotation: -1,
      details: [
        { heading: 'What it is', body: 'A Kanban board for my own ERP work: tickets, defects and configs by module (GL, AP, AR, SCM…), stage and environment.' },
        {
          heading: 'Proud of',
          body: 'Drag-and-drop stages from backlog to testing to done, with ticket types, modules and environments you can customise, synced across devices.',
        },
      ],
      stack: ['Next.js 16', 'Supabase Auth + Postgres', 'Framer Motion', 'Tailwind'],
      isPrivate: true,
    },
    {
      slug: 'colour-themes',
      number: 'No. 6',
      title: 'The colour themes',
      summary: 'VS Code colour themes: four packs, over a hundred themes, most of them tuned from one character’s palette.',
      photo: 'colour-themes',
      photoAlt: 'VS Code with the dark Camellya theme from the Wuthering Waves pack: deep reds on near-black.',
      focus: '30% 50%',
      rotation: 1,
      details: [
        { heading: 'Genshin Impact & Honkai: Star Rail', body: '46 themes in light, dark and high-contrast, each tuned from one character’s palette.' },
        { heading: 'Wuthering Waves', body: '58 themes, light and dark. A small Node script generates the first files from a template.' },
        { heading: 'Columbina', body: 'A celestial theme of ethereal blues, mystical purples and moonlit tones, in light, dark and high-contrast.' },
        { heading: 'Cupcake Maroon', body: 'A warm, cosy theme of berry wine, cherry glow and cream, with a gold focus ring. Not on the Marketplace yet.' },
      ],
      stack: ['VS Code', 'JSON themes', 'Node.js'],
      links: [
        { label: 'Genshin & HSR on the Marketplace', href: 'https://marketplace.visualstudio.com/items?itemName=frostmoon-dev.genshin-hsr-themes' },
        { label: 'Wuthering Waves on the Marketplace', href: 'https://marketplace.visualstudio.com/items?itemName=frostmoon-dev.wuwa-themes' },
        { label: 'Columbina on the Marketplace', href: 'https://marketplace.visualstudio.com/items?itemName=frostmoon-dev.columbina-theme' },
        { label: 'Cupcake Maroon on GitHub', href: 'https://github.com/frostmoon-dev/cupcake-maroon' },
      ],
      note: 'Fan-made. Character designs © miHoYo / HoYoverse and © Kuro Games.',
    },
  ] satisfies CaseFile[],
  closeLabel: 'Close the file',
  stackLabel: 'Built with',
  linksLabel: 'Where to find it',
  privateLabel: 'Private repository',
};

export type GrimoireEntry = {
  slug: string;
  numeral: string;
  title: string;
  /** Shown as written, e.g. "2022 – present". */
  when: string;
  /** Machine-readable start (for <time datetime>), when known. */
  date?: string;
  excerpt: string;
  body: string[];
};

export const grimoire = {
  title: 'The grimoire',
  intro: 'Where I have worked, what I built there, and what it taught me. Bound in something that might be leather.',
  open: 'Open the grimoire',
  close: 'Close the grimoire',
  prev: 'Previous page',
  next: 'Next page',
  hint: 'Use ← → to turn the pages',
  binding: 'Binding the pages…',
  readEntry: 'Read this chapter',
  pageOf: (a: number, b: number) => `Pages ${a} of ${b}`,
  /** The career, in the order it happened. Each becomes /grimoire/<slug>. Facts come from the CV and LinkedIn. */
  entries: [
    {
      slug: 'the-engineering-years',
      numeral: 'I',
      title: 'The engineering years',
      when: '2016 – 2020',
      date: '2016',
      excerpt: 'Electronic Engineering at UMS, and a robot that listened for screams.',
      body: [
        'Bachelor of Electronic Engineering (Computer) with Honours, Universiti Malaysia Sabah, 2016 to 2020.',
        'My research project was an IoT-based home surveillance robotic vehicle with cry and scream detection: a small machine that roams the house and listens for the sounds nobody wants to hear.',
      ],
    },
    {
      slug: 'the-apprenticeship',
      numeral: 'II',
      title: 'The apprenticeship',
      when: 'October 2019',
      date: '2019-10',
      excerpt: 'Maintenance engineer for a month, and a storage server built from loose parts.',
      body: [
        'Maintenance Engineer (apprenticeship) at Advanced Air Traffic Systems (M) Sdn. Bhd., Kota Kinabalu, October 2019.',
        'I built a Network Attached Storage (NAS) system from the ground up, and learned hardware assembly, network configuration, and what it takes to bring separate components together into one working machine.',
      ],
    },
    {
      slug: 'the-junior-consultant',
      numeral: 'III',
      title: 'The junior consultant',
      when: 'Feb 2022 – Feb 2023',
      date: '2022-02',
      excerpt: 'COMM-iT Group: first X++, and a company website rebuilt from the ground up.',
      body: [
        'Junior Consultant at COMM-iT Group, Petaling Jaya, February 2022 to February 2023.',
        'Alongside my first X++ work, I led the redesign of the company website in WordPress, reshaping its visual identity with more cohesive branding, more thoughtful presentation and a refreshed digital experience.',
      ],
    },
    {
      slug: 'the-developer',
      numeral: 'IV',
      title: 'The developer',
      when: 'Feb 2023 – Apr 2026',
      date: '2023-02',
      excerpt: 'Software Developer at COMM-iT Group. X++ by day, for three years.',
      body: [
        'Software Developer at COMM-iT Group, February 2023 to April 2026.',
        'I developed custom X++ solutions for Dynamics 365 Finance & Operations implementations; designed and customised SSRS reports, forms and data entities; configured and maintained security roles; and worked with analysts to turn requirements into technical solutions. And AL, for Business Central.',
      ],
    },
    {
      slug: 'the-certificate',
      numeral: 'V',
      title: 'The certificate',
      when: 'June 2023',
      date: '2023-06',
      excerpt: 'Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer Associate.',
      body: ['Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer Associate, June 2023.'],
    },
    {
      slug: 'the-migration',
      numeral: 'VI',
      title: 'The migration',
      when: '2023 – 2024',
      date: '2023',
      excerpt: 'Goldbell Group, Singapore: old AX 2012 code brought into D365, without overlayering.',
      body: [
        'Dynamics 365 Finance & Operations migration and implementation for Goldbell Group (Singapore), 2023 to 2024, at COMM-iT.',
        'I migrated AX 2012 legacy code into D365 F&O and optimised its performance, replaced overlayering with extensions so it stays maintainable, built custom modules for inventory management and financial reconciliation, and developed operational and financial SSRS reports.',
      ],
    },
    {
      slug: 'the-expansion',
      numeral: 'VII',
      title: 'The expansion',
      when: 'From 2024',
      date: '2024',
      excerpt: 'Goldbell Group, Malaysia: the Singapore build, taught local rules.',
      body: [
        'Dynamics 365 Finance & Operations regional expansion for Goldbell Group (Malaysia), from 2024, at COMM-iT.',
        'I adapted the Singapore implementation for Malaysia, adding localised compliance features, and customised SSRS reports and e-invoices for local regulations.',
      ],
    },
    {
      slug: 'business-central',
      numeral: 'VIII',
      title: 'Business Central',
      when: 'At COMM-iT',
      excerpt: 'JG Containers: a new system, new training, custom reports.',
      body: [
        'Dynamics 365 Business Central implementation for JG Containers (M) Sdn. Bhd., at COMM-iT.',
        'I completed Business Central technical development training, delivered custom reports and enhanced report layouts to client-specific requirements, keeping every deliverable aligned with how the business actually works.',
      ],
    },
    {
      slug: 'the-next-door',
      numeral: 'IX',
      title: 'The next door',
      when: 'Feb 2026 – present',
      date: '2026-02',
      excerpt: 'D365 F&O Associate Developer at LOGISTEED. X++ and SSRS, still after dark.',
      body: [
        'D365 F&O Associate Developer at LOGISTEED Solutions Asia-Pacific Sdn. Bhd., Bandar Baru Bangi, since February 2026 (hybrid).',
        'X++ and SQL Server Reporting Services: the same craft, a new house.',
      ],
    },
  ] satisfies GrimoireEntry[],
};

export const tea = {
  title: 'Tea at midnight',
  intro: 'There’s a seat at the table. The tea is still warm, probably.',
  sealHint: 'Click the seal',
  sealLabel: 'Break the wax seal and open the envelope',
  closeEnvelope: 'Fold the letter away',
  formTitle: 'Write to me',
  fields: {
    name: { label: 'Your name', error: 'I need something to call you.' },
    email: { label: 'Your email', error: 'That address won’t reach you. Check it?' },
    message: { label: 'Your letter', error: 'The page is blank. Write something, even a line.' },
    honeypot: 'Leave this empty',
  },
  submit: 'Send the raven',
  submitMailto: 'Send the raven',
  /** Shown under the button when the form falls back to the visitor's mail app. */
  submitMailtoNote: 'Opens your mail app with the letter ready.',
  sending: 'The raven is flying…',
  success: 'The raven made it. I’ll write back after dark.',
  successMailto: 'Your mail app should be open with the letter ready. Press send there and the raven will fly.',
  error: (email: string) => `The raven got lost. Try again, or email me directly at ${email}.`,
  /** Shown as icons. TODO: real LinkedIn and GitHub URLs. */
  links: [
    { label: 'Email', icon: 'mail', href: 'mailto:shirubawing@gmail.com', detail: 'shirubawing@gmail.com' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/fatihahmuhd/', detail: 'The professional record' },
    { label: 'GitHub', icon: 'github', href: 'https://github.com/frostmoon-dev', detail: 'Code, experiments, unfinished things' },
  ] as { label: string; icon: 'mail' | 'linkedin' | 'github'; href: string; detail: string }[],
};

export const footer = {
  line: 'Come back after dark',
  typo: { at: 6, wrong: 'o' },
  privacy:
    'No cookies, no trackers, no analytics. Your browser remembers only whether you’ve seen the intro this session and which hints you’ve used. Nothing leaves your device unless you send me a letter.',
  copyright: (year: number) => `© ${year} Teha. Text and photos all rights reserved.`,
  fontsCredit: 'Headings in American Horror Story by KELGE. Text in Atkinson Hyperlegible Next by the Braille Institute (SIL OFL).',
};

export const notFound = {
  title: 'This page fell down the wrong hole',
  label: 'Chapter ? · Missing',
  watchAlt: '',
  body: 'Whatever was here has been torn out. It happens to old books.',
  back: 'Climb back to the story',
};

export const hints = {
  storageKey: 'shiru:hints',
};
