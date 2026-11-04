/** Every route in the docs/02 routing map: prototype hash and real URL. */
export const ROUTES: Array<{ name: string; hash: string; path: string }> = [
  { name: 'home', hash: 'home', path: '/' },
  { name: 'workshop', hash: 'workshop', path: '/workshop' },
  { name: 'course-attract', hash: 'attract', path: '/courses/attract-the-right-audience' },
  { name: 'course-create', hash: 'create', path: '/courses/build-a-year-of-content' },
  { name: 'course-broadcast', hash: 'broadcast', path: '/courses/reach-the-right-audience' },
  { name: 'bundle', hash: 'bundle', path: '/courses/content-machine' },
  { name: 'book', hash: 'book', path: '/book' },
  { name: 'assessment', hash: 'assessment', path: '/assessment' },
  { name: 'assessment-thanks', hash: 'assessment-thanks', path: '/assessment/thank-you' },
  { name: 'order', hash: 'order', path: '/order/confirmed' },
  { name: 'partner', hash: 'partner', path: '/partner' },
  { name: 'contact', hash: 'contact', path: '/contact' },
  { name: 'about', hash: 'about', path: '/about' },
  { name: 'jenna', hash: 'jenna', path: '/about/jenna-colombo' },
  { name: 'speaking', hash: 'speaking', path: '/speaking' },
  { name: 'podcast', hash: 'podcast', path: '/podcast' },
  { name: 'socials', hash: 'socials', path: '/socials' },
  { name: 'careers', hash: 'careers', path: '/careers' },
  { name: 'blog', hash: 'blog', path: '/blog' },
  {
    name: 'post-08',
    hash: 'post-7',
    path: '/blog/hook-line-heart-a-simple-structure-for-content-people-actually-finish',
  },
  { name: 'legal-privacy', hash: 'legal-privacy', path: '/legal/privacy' },
  { name: 'notfound', hash: 'notfound', path: '/this-page-does-not-exist' },
]

export const VIEWPORTS = [
  { label: '1280', width: 1280, height: 900 },
  { label: '390', width: 390, height: 844 },
]

/** CSS that makes full-page screenshots comparable (docs/09). */
export const SCREENSHOT_CSS = `
  .rv{animation:none!important;opacity:1!important;transform:none!important}
  #pbtn,#panel,#cookie,[aria-label="Cookie preferences"]{display:none!important}
  #hdr,header{position:relative!important}
`
