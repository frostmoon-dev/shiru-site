/**
 * Every word on the site lives here. Edit this file; no component needs touching.
 *
 * Anything marked `TODO` is placeholder copy written in Shiru's voice so the layout reads
 * properly. Replace it before launch. Search the repo for "TODO:" to find all of them.
 */

export const site = {
  name: 'Shiru',
  /** TODO: real address. Used for the mailto fallback and the footer. */
  email: 'hello@shiru.example',
  locale: 'en',
  title: 'Shiru · ERP by day, words by night',
  description:
    'Shiru builds Dynamics 365 Finance & Operations systems in X++ by day and translates English and Malay by night. Case No. 0: subject unknown.',
  ogImage: '/og.png',
  ogImageAlt: 'The name SHIRU in pale lettering on black, under the line Case No. 0, Subject: unknown.',
} as const;

export type ChapterId = 'rabbit-hole' | 'case-files' | 'grimoire' | 'tea';

export const chapters: { id: ChapterId; numeral: string; label: string; title: string }[] = [
  { id: 'rabbit-hole', numeral: 'I', label: 'About', title: 'Down the rabbit hole' },
  { id: 'case-files', numeral: 'II', label: 'Work', title: 'The case files' },
  { id: 'grimoire', numeral: 'III', label: 'Writing', title: 'The grimoire' },
  { id: 'tea', numeral: 'IV', label: 'Contact', title: 'Tea at midnight' },
];

export const ui = {
  skip: 'Skip to the story',
  navLabel: 'Chapters',
  menuOpen: 'Open the menu.',
  menuClose: 'Close the menu',
  menuTitle: 'Where to?',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  soundLabel: 'Ambient sound',
  close: 'Close',
  backToStory: 'Back to the story',
  loading: 'The ink is still wet…',
  noWebgl: 'This candle won’t light here. The pages still read fine.',
};

export const intro = {
  skip: 'Skip intro',
  candleLabel: 'A candle is lit in the dark.',
  loading: 'Lighting the candle',
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
  name: 'Shiru',
  /** The scroll cue under the nav (links to Chapter I). */
  proceed: 'Proceed at your own discretion',
  kicker: 'Case No. 0 · Subject: unknown',
  /** Typed out one line at a time. */
  lines: ['A dreamer.', 'An overthinker.', 'A creator.'],
  /** The last words glitch. */
  tagline: { before: 'I make a living out of things that make sense. The rest ', glitch: 'keeps me awake', after: '.' },
  whisper: 'For whom do you weep?',
};

export const about = {
  label: 'Chapter I · About',
  title: 'Down the rabbit hole',
  intro: 'I fell in years ago and never found the bottom. It’s comfortable down here.',
  /** TODO: Shiru's real about text. */
  body: [
    'By day I write X++ for Microsoft Dynamics 365 Finance & Operations. Ledgers, batch jobs, the quiet plumbing that keeps a company’s money where it should be. I like it when numbers agree with each other.',
    'By night I translate and edit between English and Malay. Some words cross over easily. Others need coaxing, and a few refuse to come at all.',
    'In between, I keep an archive of Fate/Grand Order lore. Mostly so I stop forgetting which servant said what, and to whom.',
  ],
  facts: [
    { term: 'Hours', detail: 'Mostly after dark' },
    { term: 'Languages', detail: 'English, Malay, X++' },
    { term: 'Tea', detail: 'Strong. Usually cold by the time I remember it' },
  ],
  clockCaption: 'The clocks here run the other way. Nobody minds.',
};

export type CaseFile = {
  slug: string;
  number: string;
  title: string;
  stamp: string;
  summary: string;
  photo: 'case-erp' | 'case-translation' | 'case-lore';
  photoAlt: string;
  rotation: number;
  details: { heading: string; body: string }[];
  evidence: string[];
  link?: { href: string; label: string };
};

export const caseFiles = {
  label: 'Chapter II · Work',
  title: 'The case files',
  intro: 'Three open investigations. None of them are closed.',
  hint: 'Pick a file. They don’t bite. Mostly.',
  swipeHint: 'Swipe through the files',
  files: [
    {
      slug: 'erp',
      number: 'No. 365',
      title: 'The ledger that balanced itself',
      stamp: 'ERP development',
      summary: 'Dynamics 365 Finance & Operations. X++, extensions, integrations, batch jobs that run while everyone sleeps.',
      photo: 'case-erp',
      photoAlt: 'Placeholder photograph of a ledger page under a desk lamp.',
      rotation: -4,
      details: [
        {
          heading: 'What I do',
          body: 'I build and maintain customisations for D365 F&O. Extensions only: Chain of Command, event handlers, data entities. Nothing that breaks on the next update.',
        },
        {
          heading: 'What I like',
          body: 'Upgrade-safe code, clean data migrations, and reports that finance actually trusts. TODO: replace with real projects you can talk about.',
        },
      ],
      evidence: ['X++', 'Dynamics 365 F&O', 'SysOperation batch', 'Data entities & OData', 'SSRS / Electronic Reporting'],
    },
    {
      slug: 'translation',
      number: 'No. 2',
      title: 'Words that changed sides',
      stamp: 'Translation · editing',
      summary: 'English ↔ Malay. Translation, editing and proofreading for people who care how a sentence lands.',
      photo: 'case-translation',
      photoAlt: 'Placeholder photograph of two handwritten letters, one in English and one in Malay.',
      rotation: 3,
      details: [
        {
          heading: 'What I do',
          body: 'Translate, edit and proofread between English and Malay. Fiction, documentation, subtitles, the occasional cursed instruction manual.',
        },
        {
          heading: 'How I work',
          body: 'Meaning first, then voice, then the commas. TODO: add sample work, rates or a testimonial.',
        },
      ],
      evidence: ['English → Malay', 'Malay → English', 'Editing', 'Proofreading', 'Subtitles'],
    },
    {
      slug: 'lore',
      number: 'No. 7',
      title: 'The archive under the stairs',
      stamp: 'FGO lore site',
      summary: 'A personal archive of Fate/Grand Order lore. Indexed, cross-referenced, slightly obsessive.',
      photo: 'case-lore',
      photoAlt: 'Placeholder photograph of a stack of index cards tied with string.',
      rotation: -2,
      details: [
        {
          heading: 'What it is',
          body: 'A fan archive of story notes, character threads and timelines. Unofficial, not affiliated with anyone who owns the game.',
        },
        {
          heading: 'Why',
          body: 'Because I kept forgetting things I had already read twice. TODO: link the real site.',
        },
      ],
      evidence: ['Lore notes', 'Timelines', 'Cross-references'],
      /** TODO: real URL of the lore site. */
      link: { href: 'https://lore.shiru.example', label: 'Visit the archive (TODO: real link)' },
    },
  ] satisfies CaseFile[],
  closeLabel: 'Close the file',
  evidenceLabel: 'Evidence',
};

export type GrimoireEntry = {
  slug: string;
  numeral: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
};

export const grimoire = {
  label: 'Chapter III · Writing',
  title: 'The grimoire',
  intro: 'Notes, essays and lore. Bound in something that might be leather.',
  open: 'Open the grimoire',
  close: 'Close the grimoire',
  prev: 'Previous page',
  next: 'Next page',
  hint: 'Use ← → to turn the pages',
  binding: 'Binding the pages…',
  readEntry: 'Read this chapter',
  pageOf: (a: number, b: number) => `Pages ${a} of ${b}`,
  /** TODO: real entries. Each becomes /grimoire/<slug>. */
  entries: [
    {
      slug: 'the-ledger-ghost',
      numeral: 'I',
      title: 'The ledger ghost',
      date: '2026-09-12',
      excerpt: 'A batch job that ran at 3 a.m. and posted to an account nobody had opened.',
      body: [
        'TODO: placeholder essay. A batch job ran at 3 a.m. and posted to an account nobody had opened in years.',
        'It turned out to be a misconfigured posting profile. It is always a posting profile.',
      ],
    },
    {
      slug: 'words-without-a-twin',
      numeral: 'II',
      title: 'Words without a twin',
      date: '2026-08-02',
      excerpt: 'Some Malay words have no English twin. You learn to walk around them.',
      body: [
        'TODO: placeholder essay about untranslatable words.',
        'Rindu is not quite longing. Malu is not quite shame. You learn to walk around them politely.',
      ],
    },
    {
      slug: 'a-servant-index',
      numeral: 'III',
      title: 'An index of servants',
      date: '2026-06-21',
      excerpt: 'How the lore archive is organised, and why it has so many cross-references.',
      body: ['TODO: placeholder essay about how the archive is organised.'],
    },
    {
      slug: 'extensions-only',
      numeral: 'IV',
      title: 'Extensions only',
      date: '2026-05-10',
      excerpt: 'Why I never overlayer, and what Chain of Command taught me about patience.',
      body: ['TODO: placeholder essay about upgrade-safe D365 development.'],
    },
    {
      slug: 'editing-at-midnight',
      numeral: 'V',
      title: 'Editing at midnight',
      date: '2026-03-30',
      excerpt: 'The commas look different after dark. Usually they are right.',
      body: ['TODO: placeholder essay about editing.'],
    },
    {
      slug: 'the-tea-went-cold',
      numeral: 'VI',
      title: 'The tea went cold',
      date: '2026-01-14',
      excerpt: 'Short notes from a long winter. Mostly about tea.',
      body: ['TODO: placeholder notes.'],
    },
  ] satisfies GrimoireEntry[],
};

export const tea = {
  label: 'Chapter IV · Contact',
  title: 'Tea at midnight',
  intro: 'There’s a seat at the table. The tea is still warm, probably.',
  sealHint: 'Click the seal',
  sealLabel: 'Break the wax seal and open the envelope',
  closeEnvelope: 'Fold the letter away',
  formTitle: 'Write to me',
  fields: {
    name: { label: 'Your name', error: 'I need something to call you.' },
    email: { label: 'Your email', error: 'That address won’t reach you. Check it?' },
    message: { label: 'Your letter', error: 'The page is blank. Write at least a line or two.' },
    honeypot: 'Leave this empty',
  },
  submit: 'Send the raven',
  submitMailto: 'Send the raven (opens your mail app)',
  sending: 'The raven is flying…',
  success: 'The raven made it. I’ll write back after dark.',
  successMailto: 'Your mail app should be open with the letter ready. Press send there and the raven will fly.',
  error: (email: string) => `The raven got lost. Try again, or email me directly at ${email}.`,
  elsewhere: 'Or find me elsewhere',
  /** TODO: real profiles. Remove any you don't use. */
  links: [
    { label: 'Email', href: 'mailto:hello@shiru.example' },
    { label: 'LinkedIn (TODO)', href: 'https://www.linkedin.com/' },
    { label: 'GitHub (TODO)', href: 'https://github.com/' },
  ],
};

export const footer = {
  line: 'COME BACK AFTER DARK',
  typo: { at: 9, wrong: 'V' },
  privacy:
    'No cookies, no trackers, no analytics. Your browser remembers only whether you’ve seen the intro this session and which hints you’ve used. Nothing leaves your device unless you send me a letter.',
  copyright: (year: number) => `© ${year} Shiru. Text and photos all rights reserved.`,
  fontsCredit: 'Headings in American Horror Story by KELGE. Text in Atkinson Hyperlegible Next by the Braille Institute (SIL OFL).',
};

export const notFound = {
  title: 'This page fell down the wrong hole',
  label: 'Chapter ? · Missing',
  body: 'Whatever was here has been torn out. It happens to old books.',
  back: 'Climb back to the story',
};

export const hints = {
  storageKey: 'shiru:hints',
};
