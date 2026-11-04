import { BellIcon } from '@sanity/icons/Bell'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { accent, bool, cta, image, items, link, list, num, obj, PLACEHOLDER_HELP, ref, str, strings, txt } from '../helpers'

const simpleLinks = (name: string, title: string, description?: string) =>
  defineField({ name, title, description, type: 'array', of: [defineArrayMember({ type: 'simpleLink' })] })

/* ---------------- site settings ---------------- */

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'brand', title: 'Brand', default: true },
    { name: 'header', title: 'Header and menus' },
    { name: 'footer', title: 'Footer' },
    { name: 'checkout', title: 'Checkout' },
    { name: 'notices', title: 'Cookies and transition' },
    { name: 'seo', title: 'SEO defaults' },
  ],
  fields: [
    str('title', { title: 'Site name', group: 'brand', initialValue: 'Reel Good News' }),
    image('logo', { title: 'Logo (full colour)', group: 'brand', description: 'Used in the header and on light backgrounds.' }),
    image('logoInverted', { title: 'Logo (for dark backgrounds)', group: 'brand', description: 'Used in the footer and the mobile menu.' }),
    image('logoStacked', { title: 'Logo (stacked)', group: 'brand' }),
    str('contactEmail', { title: 'Contact email', group: 'brand' }),
    defineField({ name: 'linkedinUrl', title: 'LinkedIn page', type: 'url', group: 'brand', description: 'The company LinkedIn address. ' + PLACEHOLDER_HELP }),

    items(
      'headerNav',
      [
        str('label', { title: 'Menu label', required: true }),
        link('link', { title: 'Link', description: 'For a plain menu link. Leave empty when this item opens a dropdown.' }),
        obj(
          'dropdown',
          [
            list(
              'style',
              [
                { title: 'Large menu with the workshop card (Education)', value: 'mega' },
                { title: 'Simple list (Media)', value: 'list' },
              ],
              { title: 'Style', initialValue: 'list' },
            ),
            str('eyebrow', { title: 'Eyebrow', description: 'Small heading at the top of the large menu.' }),
            items(
              'items',
              [
                str('label', { title: 'Label', required: true }),
                link('link', { title: 'Link' }),
                str('description', { title: 'Second line', description: 'Leave empty when the line comes from a course price.' }),
                str('eyebrow', { title: 'Eyebrow', description: 'Optional small heading above the label, for example "Books · pre-order".' }),
                str('badge', { title: 'Badge', description: 'The square on the left: a course number, or a word for the handwritten style.' }),
                list(
                  'badgeStyle',
                  [
                    { title: 'Number', value: 'number' },
                    { title: 'Bundle icon', value: 'bundleIcon' },
                    { title: 'Handwritten word', value: 'script' },
                  ],
                  { title: 'Badge style', initialValue: 'number' },
                ),
                ref('priceFromCourse', ['course'], {
                  title: 'Price line from course',
                  description: 'Optional. Builds the second line from the course menu line and its current price, for example "Nail your go-to-market strategy first · $99 intro".',
                }),
                bool('separated', { title: 'Show below a divider' }),
              ],
              { title: 'Menu items', itemTitle: 'Menu item', preview: { select: { title: 'label', subtitle: 'description' } } },
            ),
            bool('showFeature', { title: 'Show the workshop card', description: 'The navy card set under "Workshop card in the menu".' }),
          ],
          { title: 'Dropdown', collapsed: true },
        ),
      ],
      { title: 'Main menu', group: 'header', itemTitle: 'Menu item', description: 'Drag to reorder. Links to hidden pages drop out by themselves.', preview: { select: { title: 'label' } } },
    ),
    cta('headerCta', { title: 'Header button', group: 'header' }),
    obj(
      'megaMenuFeature',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        str('headline', { title: 'Headline' }),
        str('dateBadge', { title: 'Date badge', description: 'For example "Feb 4".' }),
        str('dateLine', { title: 'Date line' }),
        str('subLine', { title: 'Second line' }),
        cta('cta', { title: 'Link' }),
      ],
      { title: 'Workshop card in the menu', group: 'header', collapsed: true },
    ),
    items(
      'mobileMenuGroups',
      [
        str('title', { title: 'Group title' }),
        list(
          'style',
          [
            { title: 'Large links', value: 'big' },
            { title: 'Pills', value: 'pills' },
          ],
          { title: 'Style', initialValue: 'pills', layout: 'radio' },
        ),
        simpleLinks('links', 'Links'),
      ],
      { title: 'Mobile menu groups', group: 'header', itemTitle: 'Group', preview: { select: { title: 'title', subtitle: 'style' } } },
    ),
    obj('mobileMenuBottom', [cta('cta', { title: 'Button' }), str('note', { title: 'Note under the button' })], {
      title: 'Mobile menu bottom',
      group: 'header',
      collapsed: true,
    }),

    obj(
      'footer',
      [
        str('newsletterEyebrow', { title: 'Newsletter eyebrow' }),
        accent('newsletterHeadline', { title: 'Newsletter headline' }),
        str('newsletterBody', { title: 'Newsletter text' }),
        str('newsletterLabel', { title: 'Email field label' }),
        str('newsletterPlaceholder', { title: 'Email field hint' }),
        str('newsletterButton', { title: 'Subscribe button' }),
        str('newsletterSuccess', { title: 'Message after subscribing' }),
        txt('tagline', { title: 'Tagline', rows: 2 }),
        str('handwrittenLine', { title: 'Handwritten line' }),
        cta('socialButton', { title: 'Social button' }),
        items('columns', [str('title', { title: 'Column title' }), simpleLinks('links', 'Links')], {
          title: 'Link columns',
          itemTitle: 'Column',
          preview: { select: { title: 'title' } },
        }),
        simpleLinks('legalLinks', 'Legal links'),
        txt('disclaimer', { title: 'Disclaimer', rows: 4 }),
        str('copyright', { title: 'Copyright line', description: '{year} becomes the current year.' }),
      ],
      { title: 'Footer', group: 'footer' },
    ),

    obj(
      'checkout',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        str('attendanceLegend', { title: 'Attendance question' }),
        str('inPersonLabel', { title: 'In person option' }),
        str('zoomLabel', { title: 'Zoom option' }),
        str('soldOutLabel', { title: 'Sold out label' }),
        str('seatsLeftLabel', { title: 'Seats left label', description: '{n} becomes the number of seats, for example "{n} left".' }),
        str('nameLabel', { title: 'Name field' }),
        str('emailLabel', { title: 'Email field' }),
        str('phoneLabel', { title: 'Mobile field' }),
        str('phoneHelp', { title: 'Mobile field help' }),
        txt('consentText', { title: 'Text message consent', rows: 3, description: 'Optional, unticked box. [Counsel to review.] Must match the wording registered for text messages.' }),
        str('totalLabel', { title: 'Total label' }),
        str('submitLabel', { title: 'Payment button' }),
        str('secureNote', { title: 'Secure payment note' }),
        str('placeholderChip', { title: 'Payment step chip', description: 'Shown until online payments are connected.' }),
        txt('placeholderBody', { title: 'Payment step text', rows: 2 }),
        str('placeholderButton', { title: 'Payment step button' }),
        str('cancelLabel', { title: 'Cancel link' }),
        str('workshopSubline', { title: 'Workshop line', description: '{ticket} becomes Early-bird or Standard.' }),
        str('courseSubline', { title: 'Course line', description: '{price} becomes "introductory price" or "regular price".' }),
        str('bundleSubline', { title: 'Bundle line' }),
        str('earlyBirdTicket', { title: 'Early-bird ticket name' }),
        str('standardTicket', { title: 'Standard ticket name' }),
        str('introPriceLabel', { title: 'Introductory price label' }),
        str('regularPriceLabel', { title: 'Regular price label' }),
      ],
      { title: 'Checkout window', group: 'checkout', description: 'Text in the window that opens from "Enroll now", "Get the bundle" and "Reserve my seat".' },
    ),

    obj(
      'cookieNotice',
      [
        str('title', { title: 'Title' }),
        txt('body', { title: 'Text', rows: 2 }),
        str('acceptLabel', { title: 'Accept button' }),
        str('declineLabel', { title: 'Decline button' }),
        str('acceptedToast', { title: 'Message after accepting' }),
        str('declinedToast', { title: 'Message after declining' }),
      ],
      { title: 'Cookie notice', group: 'notices' },
    ),
    obj(
      'sceneTransition',
      [str('topLabel', { title: 'Top label' }), str('bottomLabel', { title: 'Bottom label' }), str('productionName', { title: 'Production name on the slate' })],
      { title: 'Scene change between pages', group: 'notices', description: 'The film strip and clapperboard that play between pages.', collapsed: true },
    ),

    defineField({
      name: 'defaultSeo',
      title: 'Default search and sharing',
      type: 'seo',
      group: 'seo',
      description: 'Used when a page has no SEO fields of its own.',
    }),
    obj(
      'organization',
      [
        str('name', { title: 'Organisation name' }),
        defineField({ name: 'url', title: 'Website', type: 'url' }),
        image('logo', { title: 'Logo for search engines' }),
        strings('sameAs', { title: 'Official profiles', description: 'Full addresses of the company profiles, for example the LinkedIn page.' }),
      ],
      { title: 'Organisation details for search engines', group: 'seo', collapsed: true },
    ),
  ],
  preview: { prepare: () => ({ title: 'Site settings', media: CogIcon }) },
})

/* ---------------- announcement banner ---------------- */

export const COUNTDOWN_TARGETS = [
  { title: 'No countdown', value: 'none' },
  { title: 'End of the intro prices', value: 'introEndsAt' },
  { title: 'Courses open', value: 'coursesOpenAt' },
  { title: 'End of the early-bird price', value: 'earlyBirdEndsAt' },
  { title: 'Workshop start', value: 'workshopAt' },
  { title: 'This version\'s end date', value: 'showUntil' },
]

export const announcementBanner = defineType({
  name: 'announcementBanner',
  title: 'Announcement banner',
  type: 'document',
  icon: BellIcon,
  description: 'The dark strip above the header. The site shows the first version whose dates include today, and hides the banner after the workshop.',
  fields: [
    bool('enabled', { title: 'Show the banner', initialValue: true }),
    items(
      'variants',
      [
        str('label', { title: 'Label', description: 'Short and in capitals, for example "NEW" or "EARLY-BIRD".', max: 18 }),
        txt('message', { title: 'Message', rows: 2, max: 140 }),
        str('ctaLabel', { title: 'Link text' }),
        link('ctaLink', { title: 'Link' }),
        defineField({ name: 'showFrom', title: 'Show from', type: 'datetime', description: 'Times are stored in UTC. Midnight ET is 05:00 UTC in winter.' }),
        defineField({ name: 'showUntil', title: 'Show until', type: 'datetime', description: 'The next version usually starts at this moment.' }),
        list('countdownTo', COUNTDOWN_TARGETS, { title: '"Days left" counts down to', initialValue: 'none' }),
      ],
      {
        title: 'Versions',
        itemTitle: 'Version',
        description: 'Put them in date order. Each version switches on and off by itself on its dates.',
        preview: {
          select: { title: 'label', subtitle: 'message', from: 'showFrom', until: 'showUntil' },
          prepare: ({ title, subtitle, from, until }: { title?: string; subtitle?: string; from?: string; until?: string }) => ({
            title: `${title ?? 'Version'} · ${from ? from.slice(0, 10) : 'any time'} to ${until ? until.slice(0, 10) : 'open-ended'}`,
            subtitle,
          }),
        },
      },
    ),
  ],
  preview: { prepare: () => ({ title: 'Announcement banner', media: BellIcon }) },
})

/* ---------------- sales calendar ---------------- */

const etHelp = (what: string, example: string) =>
  `${what} Stored in UTC: midnight Eastern Time is 05:00 UTC in winter. Example: ${example}.`

export const salesCalendar = defineType({
  name: 'salesCalendar',
  title: 'Sales calendar and seats',
  type: 'document',
  icon: CalendarIcon,
  description: 'The dates that switch prices, labels, the banner and the countdowns across the site.',
  fields: [
    defineField({
      name: 'introEndsAt',
      title: 'Intro prices end',
      type: 'datetime',
      description: etHelp('Course prices switch from intro to regular at this moment.', 'end of Black Friday, Nov 27, ET = 2026-11-28 05:00 UTC'),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coursesOpenAt',
      title: 'Courses open',
      type: 'datetime',
      description: etHelp('"Opens Dec 1" labels become "On demand now".', 'Dec 1, 2026, midnight ET = 2026-12-01 05:00 UTC'),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'earlyBirdEndsAt',
      title: 'Workshop early-bird ends',
      type: 'datetime',
      description: etHelp('The workshop ticket switches from the early-bird price to the standard price.', 'end of Dec 10, ET = 2026-12-11 05:00 UTC'),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'workshopAt',
      title: 'Workshop starts',
      type: 'datetime',
      description: etHelp('The countdown target. After it, the site says the workshop has happened and hides the banner.', 'Feb 4, 2027, noon ET = 2027-02-04 17:00 UTC'),
      validation: (Rule) => Rule.required(),
    }),
    num('inPersonSeatCap', { title: 'In-person seats', integer: true, initialValue: 10, description: 'When every seat is sold, only Zoom tickets sell.' }),
    num('seatsSold', {
      title: 'In-person seats sold',
      integer: true,
      initialValue: 0,
      description: 'Update this by hand until online payments are connected. After that it updates by itself.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Sales calendar and seats', media: CalendarIcon }) },
})
