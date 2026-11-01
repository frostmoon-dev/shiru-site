/**
 * One codebase, two sites.
 *   PUBLIC_SITE_MODE unset (or "full"): the personal site. "/" is about Teha; "/work/" is the work page.
 *   PUBLIC_SITE_MODE="work": a work-only site for recruiters. "/" is the work page, and nothing personal
 *   (the hero, hobbies, astrology, socials, the Teha name) is built at all.
 * The work page never links to the personal side, in either mode.
 */
export const isWorkSite = import.meta.env.PUBLIC_SITE_MODE === 'work';
/** Where the work page lives in this build. */
export const workPath = isWorkSite ? '/' : '/work/';
