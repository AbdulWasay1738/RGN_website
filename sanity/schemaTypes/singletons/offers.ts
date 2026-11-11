import { BookIcon } from '@sanity/icons/Book'
import { PackageIcon } from '@sanity/icons/Package'
import { TiersIcon } from '@sanity/icons/Tiers'
import { UsersIcon } from '@sanity/icons/Users'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { accent, bool, cta, ICONS, image, items, link, list, num, obj, PLACEHOLDER_HELP, ref, refs, seo, slug, str, strings, txt } from '../helpers'

/** Price tokens bundle texts can use, filled in from the bundle prices (see bundlePriceTokens in lib/text.ts). */
export const BUNDLE_PRICE_HELP =
  'You can write {price}, {introPrice}, {compareAt}, {compareAtIntro} and {save}; the site fills in the numbers from the Content Machine bundle prices, so the text stays right when a price changes.'

/* ---------------- workshop ---------------- */

export const workshop = defineType({
  name: 'workshop',
  title: 'Workshop',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'ticket', title: 'Ticket and prices' },
    { name: 'content', title: 'Content' },
    { name: 'tickets', title: 'Tickets section' },
    { name: 'host', title: 'Host' },
    { name: 'archive', title: 'Archive' },
    { name: 'faq', title: 'FAQ and closing' },
    { name: 'card', title: 'Home card' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    str('title', { title: 'Workshop name', required: true, group: 'hero' }),
    slug('slug', { group: 'hero', required: false, description: 'Used for reference only. The workshop page lives at /workshop.' }),
    str('handLine', { title: 'Handwritten line', group: 'hero', description: 'Shown above the headline.' }),
    accent('headline', { title: 'Headline', required: true, group: 'hero', max: 90 }),
    txt('lead', { title: 'Lead paragraph', group: 'hero', rows: 3 }),
    strings('heroChips', { title: 'Hero chips', group: 'hero', description: 'For example "Live workshop" and "In person + Zoom". The first one is orange.' }),
    str('dateLabel', { title: 'Date', group: 'hero', description: 'As written on the page, for example "Thursday, February 4, 2027". The countdown date lives in the Sales calendar.' }),
    str('timeLabel', { title: 'Time', group: 'hero' }),
    str('venue', { title: 'Venue', group: 'hero', description: PLACEHOLDER_HELP }),
    bool('zoomAvailable', { title: 'Zoom tickets available', group: 'hero', initialValue: true }),

    num('earlyBirdPrice', { title: 'Early-bird price (USD)', group: 'ticket', required: true, description: 'Charged until the early-bird end date in the Sales calendar.' }),
    num('standardPrice', { title: 'Standard price (USD)', group: 'ticket', required: true }),
    str('reserveLabel', { title: 'Reserve button text', group: 'ticket' }),
    obj(
      'priceNotes',
      [
        str('earlyBird', { title: 'Early-bird note (hero)' }),
        str('earlyBirdShort', { title: 'Early-bird note (home card)' }),
        str('standard', { title: 'Standard note' }),
        str('perSeat', { title: 'Per seat note' }),
      ],
      { title: 'Notes beside the price', group: 'ticket' },
    ),
    obj(
      'stub',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        str('day', { title: 'Day' }),
        str('date', { title: 'Big date', description: 'For example "Feb 4".' }),
        str('line', { title: 'Line under the date' }),
        str('doneLabel', { title: 'After the workshop', description: 'Replaces the countdown once the workshop starts.' }),
      ],
      { title: 'Ticket stub', group: 'ticket' },
    ),
    strings('includes', { title: 'Every ticket includes', group: 'ticket' }),
    str('seatsLine', { title: 'Seats line', group: 'ticket', description: '{left} and {cap} become the numbers, for example "{left} of {cap} in-person seats left · then Zoom".' }),
    str('soldOutLine', { title: 'Sold out line', group: 'ticket' }),
    str('zoomChip', { title: 'Zoom chip after the seats', group: 'ticket' }),
    str('stepLabel', { title: 'Step label', group: 'ticket', description: 'For example "Step 02 · Capture".' }),

    obj(
      'whatThisIs',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('statement', { title: 'Statement', rows: 2, max: 200 }),
        defineField({ name: 'body', title: 'Text', type: 'richBody' }),
        txt('closingLine', { title: 'Closing line (bold)', rows: 2 }),
      ],
      { title: 'What this is', group: 'content' },
    ),
    accent('outcomesHeadline', { title: 'Outcomes headline', group: 'content' }),
    strings('outcomes', { title: 'Outcomes', group: 'content', description: 'One per line. The last card shows in navy.' }),
    obj(
      'agenda',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        items('items', [str('time', { title: 'Time', description: PLACEHOLDER_HELP }), str('title', { title: 'Title', required: true }), txt('description', { title: 'Description', rows: 2 })], {
          title: 'Agenda',
          itemTitle: 'Agenda item',
          preview: { select: { title: 'title', subtitle: 'time' } },
        }),
      ],
      { title: 'Agenda', group: 'content' },
    ),
    obj('whoItIsFor', [str('eyebrow', { title: 'Eyebrow' }), txt('text', { title: 'Text', rows: 3 })], { title: 'Who it is for', group: 'content' }),
    obj('noNeedFor', [str('eyebrow', { title: 'Eyebrow' }), strings('items', { title: 'Items' })], { title: 'No need for', group: 'content' }),

    obj(
      'tickets',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        str('inPersonToggle', { title: 'In person toggle' }),
        str('zoomToggle', { title: 'Zoom toggle' }),
        str('zoomToast', { title: 'Message when Zoom is picked' }),
        str('earlyBirdLabel', { title: 'Early-bird card label' }),
        str('standardLabel', { title: 'Standard card label' }),
        str('onSaleLabel', { title: 'On sale chip' }),
        str('earlyBirdWindow', { title: 'Early-bird dates' }),
        str('standardWindow', { title: 'Standard dates' }),
        str('earlyBirdEndedChip', { title: 'Early-bird ended chip' }),
        str('standardUpcomingChip', { title: 'Standard not yet on sale chip' }),
        str('earlyBirdEndedLabel', { title: 'Early-bird ended message' }),
        str('standardUpcomingLabel', { title: 'Standard not yet on sale message' }),
        items('reassurances', [list('icon', ICONS, { title: 'Icon' }), str('title', { title: 'Title' }), str('text', { title: 'Text' })], {
          title: 'Reassurances',
          itemTitle: 'Reassurance',
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
      { title: 'Tickets section', group: 'tickets' },
    ),

    obj(
      'hostSection',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        txt('body', { title: 'Text', rows: 4 }),
        image('image', { title: 'Cut-out photo', description: 'Leave empty to use the founder cut-out.' }),
        strings('chips', { title: 'Chips' }),
        str('linkLabel', { title: 'Link text' }),
        link('link', { title: 'Link' }),
      ],
      { title: 'Your hosts', group: 'host' },
    ),
    obj(
      'archive',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        txt('lead', { title: 'Lead', rows: 2 }),
        defineField({ name: 'images', title: 'Images', type: 'array', of: [defineArrayMember({ type: 'imageWithAlt' })], description: 'Add a caption to each image.' }),
      ],
      { title: 'From the archive', group: 'archive' },
    ),

    accent('faqHeadline', { title: 'FAQ headline', group: 'faq' }),
    str('faqLinkLabel', { title: 'FAQ link text', group: 'faq' }),
    link('faqLink', { title: 'FAQ link', group: 'faq' }),
    refs('faqs', ['faq'], { title: 'Questions', group: 'faq' }),
    obj('closingBand', [accent('headline', { title: 'Headline' }), str('ctaLabel', { title: 'Button text' })], { title: 'Closing orange band', group: 'faq' }),

    obj('card', [txt('summary', { title: 'Summary', rows: 3 }), strings('chips', { title: 'Chips' })], {
      title: 'Home page ticket card',
      group: 'card',
      description: 'The full-width ticket in the home offer cards.',
    }),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', date: 'dateLabel' },
    prepare: ({ title, date }) => ({ title: title || 'Workshop', subtitle: date, media: UsersIcon }),
  },
})

/* ---------------- course page labels ---------------- */

export const courseTemplate = defineType({
  name: 'courseTemplate',
  title: 'Course page labels',
  type: 'document',
  icon: TiersIcon,
  description: 'Text shared by the three course pages and the course cards.',
  groups: [
    { name: 'cards', title: 'Cards and hero', default: true },
    { name: 'price', title: 'Price card' },
    { name: 'sections', title: 'Page sections' },
  ],
  fields: [
    str('cardChipPrefix', { title: 'Card chip', group: 'cards', description: 'For example "Online course".' }),
    str('opensSoonLabel', { title: 'Card chip before courses open', group: 'cards' }),
    str('onDemandLabel', { title: 'Card chip after courses open', group: 'cards' }),
    str('heroChip', { title: 'Hero chip', group: 'cards' }),
    str('heroOpensLabel', { title: 'Hero chip before courses open', group: 'cards' }),
    str('heroOnDemandLabel', { title: 'Hero chip after courses open', group: 'cards' }),
    str('stepOfLabel', { title: 'Step chip', group: 'cards', description: '{step} becomes the step number, for example "Step {step} of 04".' }),
    str('coverLabel', { title: 'Cover label', group: 'cards', description: '{n} becomes the course number and {step} the step.' }),
    str('enrollLabel', { title: 'Enroll button', group: 'cards' }),
    str('detailsLabel', { title: 'Details button', group: 'cards' }),

    str('regularPriceLabel', { title: 'Regular price label', group: 'price' }),
    str('saveLabel', { title: 'Saving pill', group: 'price', description: 'The amount follows, for example "Save $".' }),
    str('introEndsLabel', { title: 'Intro countdown heading', group: 'price', description: 'For example "Intro price ends January 15".' }),
    str('bundleLinkIntroLabel', { title: 'Bundle link during the intro period', group: 'price', description: BUNDLE_PRICE_HELP }),
    str('bundleLinkLabel', { title: 'Bundle link after the intro period', group: 'price', description: BUNDLE_PRICE_HELP }),
    items('features', [list('icon', ICONS, { title: 'Icon' }), str('text', { title: 'Text' })], {
      title: 'Price card list',
      group: 'price',
      itemTitle: 'Line',
      preview: { select: { title: 'text', subtitle: 'icon' } },
    }),

    obj('pathWorkshop', [str('step', { title: 'Step' }), str('word', { title: 'Word' }), str('label', { title: 'Label' })], {
      title: 'Workshop on the path bar',
      group: 'sections',
    }),
    str('pathCourseLabel', { title: 'Course label on the path bar', group: 'sections', description: '{n} becomes the course number, for example "Course {n}".' }),
    str('hereLabel', { title: 'Current step label', group: 'sections' }),
    accent('coversHeadline', { title: '"What the course covers" headline', group: 'sections' }),
    str('coversCountLabel', { title: 'Lesson count label', group: 'sections', description: '{count} becomes the number of themes.' }),
    str('outcomeEyebrow', { title: 'Outcome eyebrow', group: 'sections' }),
    obj(
      'detailLabels',
      [str('format', { title: 'Format' }), str('opens', { title: 'Opens' }), str('hostedOn', { title: 'Hosted on' }), str('bestFor', { title: 'Best for' })],
      { title: 'Detail tile labels', group: 'sections' },
    ),
    obj(
      'bundleUpsell',
      [
        str('chip', { title: 'Chip' }),
        str('headline', { title: 'Headline' }),
        txt('bodyIntro', { title: 'Text during the intro period', rows: 2, description: BUNDLE_PRICE_HELP }),
        txt('body', { title: 'Text after the intro period', rows: 2, description: BUNDLE_PRICE_HELP }),
        str('ctaLabel', { title: 'Button text' }),
      ],
      { title: 'Bundle panel', group: 'sections' },
    ),
    accent('faqHeadline', { title: 'FAQ headline', group: 'sections' }),
    obj('teacherCard', [image('image', { title: 'Photo' }), str('title', { title: 'Title' }), str('text', { title: 'Text' })], {
      title: '"Taught by our team" card',
      group: 'sections',
    }),
  ],
  preview: { prepare: () => ({ title: 'Course page labels', media: TiersIcon }) },
})

/* ---------------- bundle ---------------- */

export const bundle = defineType({
  name: 'bundle',
  title: 'Content Machine bundle',
  type: 'document',
  icon: PackageIcon,
  groups: [
    { name: 'hero', title: 'Hero and price', default: true },
    { name: 'content', title: 'Page sections' },
    { name: 'card', title: 'Home card' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    str('title', { title: 'Name', required: true, group: 'hero' }),
    slug('slug', { group: 'hero', required: false, description: 'Used for reference only. The bundle page lives at /courses/content-machine.' }),
    accent('headline', { title: 'Headline', group: 'hero' }),
    str('subline', { title: 'Subheadline', group: 'hero' }),
    strings('chips', { title: 'Chips', group: 'hero' }),
    num('price', { title: 'Regular price (USD)', required: true, group: 'hero', description: 'Charged after the intro period ends.' }),
    num('introPrice', {
      title: 'Introductory price (USD)',
      group: 'hero',
      description: 'Charged until the intro period ends (Site > Sales calendar and seats). Leave empty for no intro price.',
    }),
    num('compareAt', {
      title: 'Courses bought separately: regular prices (USD)',
      group: 'hero',
      description: 'The three regular course prices added up. Shown struck through after the intro period.',
    }),
    num('compareAtIntro', {
      title: 'Courses bought separately: intro prices (USD)',
      group: 'hero',
      description: 'The three intro course prices added up. Used in the math text during the intro period.',
    }),
    str('introLabel', { title: 'Intro price chip', group: 'hero', description: `Shown during the intro period, for example "Intro price through Jan 15". ${BUNDLE_PRICE_HELP}` }),
    str('saveLabel', { title: 'Saving chip', group: 'hero', description: `Shown after the intro period, for example "Save {save}". ${BUNDLE_PRICE_HELP}` }),
    str('ctaLabel', { title: 'Buy button text', group: 'hero' }),
    obj(
      'path',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        str('regularPriceLabel', { title: 'Regular price wording', description: 'For example "regular price".' }),
        items('items', [ref('course', ['course'], { title: 'Course', required: true }), str('line', { title: 'Line' })], {
          title: 'Lines for each course',
          description:
            'The line shown under each course on the bundle page. Which courses are in the bundle is set on each course ("Part of the Content Machine bundle"); a course with no line here shows its menu line.',
          itemTitle: 'Course',
          preview: { select: { title: 'course.title', subtitle: 'line' } },
        }),
      ],
      { title: 'The path', group: 'content' },
    ),
    obj(
      'maths',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        txt('bodyIntro', { title: 'Text during the intro period', rows: 2, description: BUNDLE_PRICE_HELP }),
        txt('body', { title: 'Text after the intro period', rows: 2, description: BUNDLE_PRICE_HELP }),
        str('courseColumn', { title: 'Course column heading' }),
        str('introColumn', { title: 'Intro price column heading', description: 'For example "Intro, through Jan 15". This column shows only during the intro period.' }),
        str('priceColumn', { title: 'Regular price column heading' }),
        str('separateLabel', { title: 'Total row label' }),
        str('totalNoteIntro', {
          title: 'Line under the bundle name during the intro period',
          description: `For example "Intro price through January 15, then {price}". After the intro period the saving chip text shows here. ${BUNDLE_PRICE_HELP}`,
        }),
      ],
      { title: 'The math table', group: 'content', description: 'The table adds up the course prices by itself.' },
    ),
    obj('pairWithWorkshop', [str('eyebrow', { title: 'Eyebrow' }), accent('headline', { title: 'Headline' }), txt('body', { title: 'Text', rows: 2 }), cta('cta', { title: 'Button' })], {
      title: 'Pair with the workshop',
      group: 'content',
    }),
    accent('faqHeadline', { title: 'FAQ headline', group: 'content' }),
    refs('faqs', ['faq'], { title: 'Questions', group: 'content' }),
    obj(
      'card',
      [str('chip', { title: 'Chip' }), txt('body', { title: 'Text', rows: 2 }), str('ctaLabel', { title: 'Button text' }), str('fanWord', { title: 'Handwritten word on the cards' })],
      { title: 'Home page card', group: 'card' },
    ),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', price: 'price' },
    prepare: ({ title, price }) => ({ title: title || 'Bundle', subtitle: price ? `$${price}` : '', media: PackageIcon }),
  },
})

/* ---------------- book ---------------- */

export const book = defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  icon: BookIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'cover', title: 'Cover' },
    { name: 'content', title: 'Page sections' },
    { name: 'card', title: 'Home card' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    bool('hidden', {
      title: 'Hide the book page',
      group: 'hero',
      description: 'Hides /book, removes it from the menus and the sitemap, and drops the book card from the home page.',
    }),
    str('title', { title: 'Title', required: true, group: 'hero' }),
    str('chip', { title: 'Chip', group: 'hero' }),
    txt('subtitle', { title: 'Subtitle', group: 'hero', rows: 2 }),
    str('publicationLine', { title: 'Publication line', group: 'hero', description: PLACEHOLDER_HELP }),
    str('price', { title: 'Price', group: 'hero', description: 'As shown, for example "$24". ' + PLACEHOLDER_HELP }),
    defineField({
      name: 'preorderUrl',
      title: 'Pre-order link',
      type: 'url',
      group: 'hero',
      description: 'Where the pre-order button goes, for example the retailer page. Until it is set, the button shows the message below.',
    }),
    str('ctaLabel', { title: 'Pre-order button text', group: 'hero' }),
    str('byline', { title: 'Byline', group: 'hero' }),
    obj('noLinkMessage', [str('eyebrow', { title: 'Eyebrow' }), txt('body', { title: 'Message', rows: 2 }), str('buttonLabel', { title: 'Button text' })], {
      title: 'Message before the pre-order link exists',
      group: 'hero',
      collapsed: true,
    }),

    str('coverAccentWord', { title: 'Cover word in orange', group: 'cover' }),
    str('coverRest', { title: 'Rest of the cover title', group: 'cover' }),
    txt('coverTagline', { title: 'Cover tagline', group: 'cover', rows: 2 }),
    str('author', { title: 'Author on the cover', group: 'cover' }),
    str('spineText', { title: 'Spine text', group: 'cover' }),

    image('photo', {
      title: 'Photo',
      group: 'content',
      description: 'Shown beside the statement, for example someone reading the book. A landscape photo works best. Leave empty for none.',
    }),
    accent('statement', { title: 'Statement', group: 'content', rows: 2, max: 200 }),
    defineField({ name: 'body', title: 'Text', type: 'richBody', group: 'content' }),
    obj(
      'inside',
      [
        accent('headline', { title: 'Headline' }),
        str('eyebrow', { title: 'Eyebrow' }),
        items('items', [str('word', { title: 'Handwritten word' }), txt('line', { title: 'Line', rows: 2 })], {
          title: 'Tiles',
          itemTitle: 'Tile',
          preview: { select: { title: 'word', subtitle: 'line' } },
        }),
      ],
      { title: 'What\'s inside', group: 'content' },
    ),
    obj('quote', [str('eyebrow', { title: 'Eyebrow' }), txt('text', { title: 'Quote', rows: 3 })], { title: 'Quote', group: 'content' }),
    obj(
      'preorderBonus',
      [bool('show', { title: 'Show the bonus card' }), str('eyebrow', { title: 'Eyebrow' }), txt('text', { title: 'Bonus', rows: 2 })],
      { title: 'Pre-order bonus', group: 'content', description: 'Show this card only when there is a bonus.' },
    ),
    obj('card', [str('chip', { title: 'Chip' }), txt('body', { title: 'Text', rows: 2 }), str('ctaLabel', { title: 'Button text' })], {
      title: 'Home page card',
      group: 'card',
    }),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', hidden: 'hidden' },
    prepare: ({ title, hidden }) => ({ title: title || 'Book', subtitle: hidden ? 'Hidden' : 'Live', media: BookIcon }),
  },
})
