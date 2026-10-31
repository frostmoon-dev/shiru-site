/**
 * Every word on the site lives here. Edit this file; no component needs touching.
 *
 * Anything marked `TODO` is placeholder copy written in Teha's voice so the layout reads
 * properly. Replace it before launch. Search the repo for "TODO:" to find all of them.
 */

export const site = {
  name: 'Teha',
  /** Used for the mailto fallback, the contact icons and the footer. */
  email: 'shinabaeing@gmail.com',
  locale: 'en',
  title: 'Teha · ERP by day, words by night',
  description:
    'Teha builds Dynamics 365 Finance & Operations systems in X++ by day and wanders into peculiar projects by night. Case No. 0: subject unknown.',
  ogImage: '/og.png',
  ogImageAlt: 'The name TEHA in pale lettering on black, under the line Case No. 0, Subject: unknown.',
} as const;

export type ChapterId = 'rabbit-hole' | 'archives' | 'grimoire' | 'tea';

export const chapters: { id: ChapterId; numeral: string; label: string; title: string }[] = [
  { id: 'rabbit-hole', numeral: 'I', label: 'About', title: 'Down the rabbit hole' },
  { id: 'archives', numeral: 'II', label: 'Work', title: 'The archives' },
  { id: 'grimoire', numeral: 'III', label: 'Writing', title: 'The grimoire' },
  { id: 'tea', numeral: 'IV', label: 'Contact', title: 'Tea at midnight' },
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
    /** TODO: your real LinkedIn URL. */
    { term: 'LinkedIn', detail: 'The professional record', href: 'https://www.linkedin.com/' },
  ] as { term: string; detail: string; href?: string }[],
  warning: 'Careful. Looks can deceive.',
};

export type CaseFile = {
  slug: string;
  number: string;
  title: string;
  stamp: string;
  summary: string;
  photo: 'archive-moonpaper' | 'archive-napyru' | 'archive-moona' | 'archive-visual-themes';
  photoAlt: string;
  rotation: number;
  details: { heading: string; body: string }[];
  evidence: string[];
  link?: { href: string; label: string };
};

export const caseFiles = {
  title: 'The archives',
  intro: 'Four open investigations. None of them are closed.',
  hint: 'Pick a file. They don’t bite. Mostly.',
  swipeHint: 'Swipe through the files',
  /** TODO: everything below each title is placeholder: what each project is, and a real photo. */
  files: [
    {
      slug: 'moonpaper',
      number: 'No. 1',
      title: 'MoonPaper',
      stamp: 'Project',
      summary: 'TODO: one or two lines on what MoonPaper is.',
      photo: 'archive-moonpaper',
      photoAlt: 'Placeholder image for MoonPaper.',
      rotation: -2,
      details: [{ heading: 'What it is', body: 'TODO: describe MoonPaper.' }],
      evidence: ['TODO'],
    },
    {
      slug: 'napyru',
      number: 'No. 2',
      title: 'Napyru',
      stamp: 'Project',
      summary: 'TODO: one or two lines on what Napyru is.',
      photo: 'archive-napyru',
      photoAlt: 'Placeholder image for Napyru.',
      rotation: 1.5,
      details: [{ heading: 'What it is', body: 'TODO: describe Napyru.' }],
      evidence: ['TODO'],
    },
    {
      slug: 'moona',
      number: 'No. 3',
      title: 'Moona',
      stamp: 'Project',
      summary: 'TODO: one or two lines on what Moona is.',
      photo: 'archive-moona',
      photoAlt: 'Placeholder image for Moona.',
      rotation: -1.5,
      details: [{ heading: 'What it is', body: 'TODO: describe Moona.' }],
      evidence: ['TODO'],
    },
    {
      slug: 'visual-themes',
      number: 'No. 4',
      title: 'Visual themes',
      stamp: 'Project',
      summary: 'TODO: one or two lines on the visual themes.',
      photo: 'archive-visual-themes',
      photoAlt: 'Placeholder image for Visual themes.',
      rotation: 2,
      details: [{ heading: 'What they are', body: 'TODO: describe the visual themes.' }],
      evidence: ['TODO'],
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
  submitMailto: 'Send the raven',
  /** Shown under the button when the form falls back to the visitor's mail app. */
  submitMailtoNote: 'Opens your mail app with the letter ready.',
  sending: 'The raven is flying…',
  success: 'The raven made it. I’ll write back after dark.',
  successMailto: 'Your mail app should be open with the letter ready. Press send there and the raven will fly.',
  error: (email: string) => `The raven got lost. Try again, or email me directly at ${email}.`,
  /** Shown as icons. TODO: real LinkedIn and GitHub URLs. */
  links: [
    { label: 'Email', icon: 'mail', href: 'mailto:shinabaeing@gmail.com', detail: 'shinabaeing@gmail.com' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/', detail: 'The professional record' },
    { label: 'GitHub', icon: 'github', href: 'https://github.com/', detail: 'Code, experiments, unfinished things' },
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
