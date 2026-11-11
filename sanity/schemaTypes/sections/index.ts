/**
 * Page-builder sections: the library of ready-made Reel Good News sections
 * the client builds pages from. Field names match lib/sanity/types.ts.
 */
import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { BlockquoteIcon } from '@sanity/icons/Blockquote'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CommentIcon } from '@sanity/icons/Comment'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { ImageIcon } from '@sanity/icons/Image'
import { ImagesIcon } from '@sanity/icons/Images'
import { LaunchIcon } from '@sanity/icons/Launch'
import { LinkIcon } from '@sanity/icons/Link'
import { ListIcon } from '@sanity/icons/List'
import { MicrophoneIcon } from '@sanity/icons/Microphone'
import { NumberIcon } from '@sanity/icons/Number'
import { PresentationIcon } from '@sanity/icons/Presentation'
import { RocketIcon } from '@sanity/icons/Rocket'
import { StarIcon } from '@sanity/icons/Star'
import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { TimelineIcon } from '@sanity/icons/Timeline'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import { UserIcon } from '@sanity/icons/User'
import { UsersIcon } from '@sanity/icons/Users'
import { BarChartIcon } from '@sanity/icons/BarChart'
import { BasketIcon } from '@sanity/icons/Basket'
import { SparklesIcon } from '@sanity/icons/Sparkles'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { defineArrayMember, defineField } from 'sanity'
import {
  accent,
  bool,
  cta,
  defineSection,
  ICONS,
  image,
  items,
  link,
  list,
  obj,
  PLACEHOLDER_HELP,
  ref,
  refs,
  str,
  strings,
  txt,
} from '../helpers'

/* ---------------- home sections ---------------- */

export const heroFounder = defineSection({
  name: 'heroFounder',
  title: 'Founder hero',
  icon: RocketIcon,
  description:
    'The home page opening: eyebrow, two-line headline, buttons and support line beside the founder portrait. Calm on purpose (client feedback): no emblem, brush stroke or floating cards.',
  defaultBackground: 'navy',
  watermark: false,
  fields: [
    str('eyebrow', { title: 'Eyebrow', description: 'Small capitals above the headline, for example "Strategic content. Built for business growth."' }),
    accent('headline', {
      title: 'Headline',
      required: true,
      max: 90,
      rows: 2,
      description:
        'Start a new line where the headline should break. Wrap the underlined word in _underscores_; it can sit inside the coloured words, for example "Attract more best fit customers." on the first line and "*Win more _business._*" on the second.',
    }),
    txt('lead', { title: 'Lead paragraph', rows: 4, max: 320 }),
    cta('primaryCta', { title: 'Main button' }),
    cta('secondaryCta', { title: 'Second button' }),
    txt('supportLine', { title: 'Support line', rows: 2, max: 160, description: 'The short line under the buttons, with the coral rule on its left.' }),
    image('portrait', { title: 'Portrait cut-out', description: 'A photo with a transparent background (WebP or PNG). Leave empty to use the founder cut-out.' }),
    obj('lowerThird', [str('tag', { title: 'Tag' }), str('name', { title: 'Name' }), str('title', { title: 'Title line' })], {
      title: 'Name banner',
      description: 'The TV-style name strip at the bottom of the portrait.',
      collapsed: true,
    }),
  ],
})

export const ticker = defineSection({
  name: 'ticker',
  title: 'Gradient ticker',
  icon: SparklesIcon,
  description: 'The scrolling band of short phrases with star separators.',
  titleField: 'phrases.0',
  fields: [strings('phrases', { title: 'Phrases', description: 'Short phrases. They scroll in a loop and alternate white and lavender.' })],
})

export const methodCalendar = defineSection({
  name: 'methodCalendar',
  title: 'Year calendar (the method)',
  icon: CalendarIcon,
  description: 'One production day becomes a year of content, shown as a calendar that ripples out from Day 1.',
  defaultBackground: 'paper',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    txt('body', { title: 'Paragraph', rows: 4 }),
    obj(
      'calendar',
      [
        str('title', { title: 'Card title' }),
        str('replayLabel', { title: 'Replay button' }),
        txt('caption', { title: 'Caption', rows: 2 }),
        str('typicalLabel', { title: 'Typical approach label' }),
        str('typicalNote', { title: 'Typical approach note' }),
        str('approachLabel', { title: 'Our approach label' }),
        str('approachNote', { title: 'Our approach note' }),
        str('calloutTag', { title: 'Day 1 tag' }),
        str('legendProduction', { title: 'Legend: production day' }),
        str('legendContent', { title: 'Legend: published content' }),
        txt('ariaLabel', { title: 'Screen reader description', rows: 3, description: 'Describes the calendar for people who cannot see it.' }),
      ],
      { title: 'Calendar card text', collapsed: true },
    ),
  ],
})

export const howItWorks = defineSection({
  name: 'howItWorks',
  title: 'How it works (steps)',
  icon: NumberIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    txt('note', { title: 'Side note', rows: 2 }),
    items(
      'steps',
      [
        str('number', { title: 'Number', description: 'For example "01".' }),
        str('name', { title: 'Name', required: true }),
        list('icon', ICONS, { title: 'Icon' }),
        txt('text', { title: 'Text', rows: 3 }),
        str('linkLabel', { title: 'Link text' }),
        link('link', { title: 'Link' }),
      ],
      { title: 'Steps', itemTitle: 'Step', preview: { select: { title: 'name', subtitle: 'number' } } },
    ),
  ],
})

export const offerGrid = defineSection({
  name: 'offerGrid',
  title: 'Offer cards',
  icon: BasketIcon,
  description: 'The workshop ticket, course cards, bundle card and book card.',
  defaultBackground: 'paper',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    txt('note', { title: 'Side note', rows: 2 }),
    refs('items', ['workshop', 'course', 'bundle', 'book'], {
      title: 'Offers',
      description: 'Add, remove and drag to reorder. The workshop shows as a full-width ticket, courses sit in a row of three, the bundle and book share a row. A hidden book does not show.',
    }),
  ],
})

export const assessmentCta = defineSection({
  name: 'assessmentCta',
  title: 'Assessment call to action',
  icon: BarChartIcon,
  description: 'Promotes the free Marketing ROI Assessment, with the five areas and the sample report.',
  defaultBackground: 'ink',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    txt('body', { title: 'Paragraph', rows: 3 }),
    cta('cta', { title: 'Button' }),
    bool('showAreas', { title: 'Show the five areas', initialValue: true, description: 'The area names come from the Assessment settings.' }),
    bool('showReportMock', { title: 'Show the sample report', initialValue: true }),
    bool('tornTopEdge', { title: 'Torn paper top edge', initialValue: true }),
  ],
})

export const statsBlock = defineSection({
  name: 'statsBlock',
  title: 'Proof numbers',
  icon: TrendUpwardIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    bool('showBadge', { title: 'Show the orange R badge', initialValue: false, description: 'Keep it off on the home page (client feedback round two).' }),
    list(
      'variant',
      [
        { title: 'Large numbers with a top rule (home)', value: 'rule' },
        { title: 'Lavender strip (founder page)', value: 'strip' },
      ],
      { title: 'Style', initialValue: 'rule', layout: 'radio' },
    ),
    refs('stats', ['stat'], { title: 'Numbers', description: 'Pick proof numbers from the Library.' }),
    txt('footnote', { title: 'Footnote', rows: 2 }),
  ],
  fallbackTitle: 'Proof numbers',
})

export const testimonials = defineSection({
  name: 'testimonials',
  title: 'Testimonials',
  icon: CommentIcon,
  fields: [
    list(
      'variant',
      [
        { title: 'Carousel with mini quotes (home)', value: 'carousel' },
        { title: 'Grid of quote cards', value: 'grid' },
      ],
      { title: 'Style', initialValue: 'carousel', layout: 'radio' },
    ),
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', description: 'Used by the grid style.' }),
    refs('items', ['testimonial'], { title: 'Quotes', description: 'Pick quotes from the Library. Only quotes with written permission belong here.' }),
    str('logoStripLabel', { title: 'Logo strip label' }),
    items(
      'logos',
      [
        str('name', { title: 'Name', required: true }),
        list(
          'style',
          [
            { title: 'Display (tall capitals)', value: 'display' },
            { title: 'Spaced capitals', value: 'caps' },
            { title: 'Body font', value: 'body' },
            { title: 'Plain', value: 'plain' },
          ],
          { title: 'Lettering' },
        ),
      ],
      { title: 'Client and partner names', itemTitle: 'Name', preview: { select: { title: 'name', subtitle: 'style' } } },
    ),
  ],
  fallbackTitle: 'Testimonials',
})

export const founderStory = defineSection({
  name: 'founderStory',
  title: 'Founder story',
  icon: UserIcon,
  description: 'Photo in the torn felt frame with lavender shards, the story and three timeline cards.',
  defaultBackground: 'paper',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    str('handLine', { title: 'Handwritten line', description: 'Optional. Leave empty for none.' }),
    txt('body', { title: 'Paragraph', rows: 5 }),
    image('photo', { title: 'Photo', description: 'A portrait photo. Leave empty to use the founder portrait.' }),
    str('signature', { title: 'Signature', description: 'Optional handwritten name over the photo. Leave empty for none.' }),
    refs('timeline', ['timelineEntry'], { title: 'Timeline cards' }),
    bool('showYears', { title: 'Show years on the timeline cards', initialValue: false, description: 'Off: the cards show only the company and the line under it.' }),
    cta('cta', { title: 'Button' }),
  ],
})

export const faqBlock = defineSection({
  name: 'faqBlock',
  title: 'FAQ',
  icon: HelpCircleIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    txt('note', { title: 'Side note', rows: 2 }),
    cta('cta', { title: 'Link under the note' }),
    bool('openFirst', { title: 'Open the first answer', initialValue: true }),
    refs('faqs', ['faq'], { title: 'Questions', description: 'Pick questions from the Library and drag to reorder.' }),
  ],
  fallbackTitle: 'FAQ',
})

export const finalCta = defineSection({
  name: 'finalCta',
  title: 'Closing call to action',
  icon: LaunchIcon,
  description: 'The big orange band with the workshop call to action and countdown.',
  defaultBackground: 'orange',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline', required: true }),
    cta('cta', { title: 'Button' }),
    bool('showCountdown', { title: 'Show the workshop countdown', initialValue: true, description: 'Hides by itself once the workshop starts.' }),
  ],
})

/* ---------------- inner page sections ---------------- */

export const pageHero = defineSection({
  name: 'pageHero',
  title: 'Page hero',
  icon: PresentationIcon,
  description: 'The opening of an inner page: eyebrow, headline, lead, buttons and optional art.',
  defaultBackground: 'paper',
  fieldsets: [{ name: 'art', title: 'Art', options: { collapsible: true, collapsed: false } }],
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    defineField({ name: 'crumbParent', title: 'Breadcrumb parent', type: 'simpleLink', description: 'Optional. For example "About the Team" on the founder page.' }),
    str('crumbCurrent', { title: 'Breadcrumb current page', description: 'Optional. Uses the page name when empty.' }),
    str('handLine', { title: 'Handwritten line' }),
    list(
      'handLinePosition',
      [
        { title: 'Above the headline', value: 'above' },
        { title: 'Below the lead', value: 'below' },
      ],
      { title: 'Handwritten line position', initialValue: 'above', layout: 'radio' },
    ),
    accent('headline', { title: 'Headline', required: true, max: 120 }),
    list(
      'headingSize',
      [
        { title: 'Default', value: 'default' },
        { title: 'Large', value: 'large' },
        { title: 'Extra large (short headlines)', value: 'xl' },
      ],
      { title: 'Headline size', initialValue: 'default', layout: 'radio' },
    ),
    txt('lead', { title: 'Lead paragraph', rows: 3 }),
    txt('sublead', { title: 'Subheadline', rows: 2, description: 'Optional larger line under the headline.' }),
    strings('chips', { title: 'Chips', description: 'Optional short labels shown as pills.' }),
    defineField({ name: 'ctas', title: 'Buttons', type: 'array', of: [defineArrayMember({ type: 'cta' })] }),
    list(
      'art',
      [
        { title: 'None', value: 'none' },
        { title: 'Portrait cut-out', value: 'portraitCutout' },
        { title: 'Portrait over a spinning reel', value: 'reelPortrait' },
        { title: 'Large quotation mark', value: 'quoteMark' },
        { title: 'Spinning reel', value: 'reel' },
        { title: 'Three steps', value: 'steps' },
        { title: 'LinkedIn card', value: 'linkedinCard' },
        { title: 'Orange portrait card', value: 'portraitCard' },
        { title: 'Podcast cover', value: 'podcastCover' },
      ],
      { title: 'Art', fieldset: 'art', initialValue: 'none' },
    ),
    image('image', { title: 'Image', fieldset: 'art', description: 'For the portrait styles. Leave empty to use the founder cut-out.' }),
    items(
      'artSteps',
      [str('number', { title: 'Number' }), str('title', { title: 'Title' }), str('text', { title: 'Text' })],
      {
        title: 'Steps',
        fieldset: 'art',
        itemTitle: 'Step',
        hidden: ({ parent }) => parent?.art !== 'steps',
        preview: { select: { title: 'title', subtitle: 'number' } },
      },
    ),
    obj(
      'artCard',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        str('title', { title: 'Title' }),
        txt('text', { title: 'Text', rows: 2 }),
        str('chip', { title: 'Chip' }),
        link('link', { title: 'Link' }),
      ],
      {
        title: 'Card text',
        fieldset: 'art',
        description: 'Text for the LinkedIn card, the portrait card chip or the podcast cover.',
        hidden: ({ parent }) => !['linkedinCard', 'portraitCard', 'podcastCover'].includes(parent?.art),
      },
    ),
  ],
})

export const statement = defineSection({
  name: 'statement',
  title: 'Statement',
  icon: BlockquoteIcon,
  description: 'A big statement on one side and supporting text on the other.',
  titleField: 'statement',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('statement', { title: 'Statement', required: true, rows: 2, max: 200 }),
    defineField({ name: 'body', title: 'Supporting text', type: 'richBody' }),
    list(
      'bodyStyle',
      [
        { title: 'Regular', value: 'plain' },
        { title: 'Lead (larger)', value: 'lead' },
      ],
      { title: 'Text size', initialValue: 'plain', layout: 'radio' },
    ),
    txt('closingLine', { title: 'Closing line', rows: 2, description: 'Optional bold line after the text.' }),
    str('sideEyebrow', { title: 'List eyebrow', description: 'Optional. For example "What happens next".' }),
    strings('sideList', { title: 'Numbered list', description: 'Optional. Shows as numbered cards beside the statement. The last one is orange.' }),
  ],
})

export const valuesGrid = defineSection({
  name: 'valuesGrid',
  title: 'Values grid',
  icon: ThLargeIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    list(
      'style',
      [
        { title: 'Cards with an orange title', value: 'cards' },
        { title: 'Numbered cards', value: 'numbered' },
      ],
      { title: 'Style', initialValue: 'cards', layout: 'radio' },
    ),
    items('items', [str('title', { title: 'Title', required: true }), txt('text', { title: 'Text', rows: 2 })], {
      title: 'Values',
      itemTitle: 'Value',
      preview: { select: { title: 'title', subtitle: 'text' } },
    }),
  ],
})

export const timeline = defineSection({
  name: 'timeline',
  title: 'Timeline',
  icon: TimelineIcon,
  fields: [
    accent('headline', { title: 'Headline' }),
    list(
      'style',
      [
        { title: 'Dots on a dashed line (About)', value: 'steps' },
        { title: 'Record cards (founder page)', value: 'cards' },
      ],
      { title: 'Style', initialValue: 'steps', layout: 'radio' },
    ),
    refs('entries', ['timelineEntry'], { title: 'Entries' }),
  ],
})

export const teamGrid = defineSection({
  name: 'teamGrid',
  title: 'Team',
  icon: UsersIcon,
  defaultBackground: 'paper',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    refs('members', ['teamMember'], { title: 'Team members', description: 'Add people from Library > Team members. Members without a photo show as a placeholder card.' }),
    bool('showHiringCard', { title: 'Show the hiring card', initialValue: true }),
    obj(
      'hiringCard',
      [str('eyebrow', { title: 'Eyebrow' }), str('headline', { title: 'Headline' }), str('linkLabel', { title: 'Link text' }), link('link', { title: 'Link' })],
      { title: 'Hiring card', hidden: ({ parent }) => !parent?.showHiringCard },
    ),
  ],
})

export const ctaPanels = defineSection({
  name: 'ctaPanels',
  title: 'Call to action panels',
  icon: LinkIcon,
  titleField: 'panels.0.headline',
  fallbackTitle: 'Call to action panels',
  fields: [
    items(
      'panels',
      [
        accent('headline', { title: 'Headline', required: true }),
        cta('cta', { title: 'Button' }),
        list(
          'tone',
          [
            { title: 'Lavender', value: 'lavender' },
            { title: 'Navy', value: 'navy' },
          ],
          { title: 'Colour', initialValue: 'lavender', layout: 'radio' },
        ),
      ],
      { title: 'Panels', itemTitle: 'Panel', preview: { select: { title: 'headline', subtitle: 'tone' } } },
    ),
  ],
})

export const gallery = defineSection({
  name: 'gallery',
  title: 'Gallery',
  icon: ImagesIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    txt('lead', { title: 'Lead paragraph', rows: 2 }),
    list(
      'style',
      [
        { title: 'Image cards with captions', value: 'cards' },
        { title: 'Tilted photos beside the headline', value: 'tilted' },
      ],
      { title: 'Style', initialValue: 'cards', layout: 'radio' },
    ),
    defineField({
      name: 'items',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          name: 'itemsItem',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', description: 'Card title (cards style).' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        }),
      ],
    }),
    obj(
      'linkCard',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        str('title', { title: 'Title' }),
        str('text', { title: 'Text' }),
        str('ctaLabel', { title: 'Button text' }),
        link('link', { title: 'Link' }),
      ],
      { title: 'Link card', description: 'Optional lavender card after the images, for example the next workshop.', collapsed: true },
    ),
  ],
})

export const formSection = defineSection({
  name: 'formSection',
  title: 'Form',
  icon: EnvelopeIcon,
  description: 'A ready-made form. The fields are fixed; the text around them is editable. Submissions go to the CRM once it is connected.',
  fieldsets: [
    { name: 'side', title: 'Beside the form', options: { collapsible: true, collapsed: true } },
    { name: 'success', title: 'After sending', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    list(
      'form',
      [
        { title: 'Contact', value: 'contact' },
        { title: 'Partner application', value: 'partner' },
        { title: 'Speaking request', value: 'speaking' },
        { title: 'Podcast guest pitch', value: 'guest' },
        { title: 'Talent community', value: 'talent' },
      ],
      { title: 'Which form', required: true },
    ),
    list(
      'layout',
      [
        { title: 'Standard (heading beside the form)', value: 'standard' },
        { title: 'Page opening (large headline, used on Contact)', value: 'hero' },
      ],
      { title: 'Layout', initialValue: 'standard', layout: 'radio' },
    ),
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    txt('intro', { title: 'Intro', rows: 2 }),
    list(
      'panelTone',
      [
        { title: 'Paper', value: 'paper' },
        { title: 'White', value: 'white' },
        { title: 'Lavender tint', value: 'lavender-tint' },
      ],
      { title: 'Form panel colour', initialValue: 'paper' },
    ),
    obj(
      'side',
      [
        list(
          'kind',
          [
            { title: 'Nothing', value: 'none' },
            { title: 'A testimonial', value: 'quote' },
            { title: 'Email card with a copy button', value: 'emailCard' },
            { title: 'Open roles', value: 'roles' },
          ],
          { title: 'Show', initialValue: 'none' },
        ),
        ref('quote', ['testimonial'], { title: 'Testimonial', hidden: ({ parent }) => parent?.kind !== 'quote' }),
        str('emailLabel', { title: 'Email label', hidden: ({ parent }) => parent?.kind !== 'emailCard' }),
        str('email', { title: 'Email address', hidden: ({ parent }) => parent?.kind !== 'emailCard' }),
        str('copyLabel', { title: 'Copy button text', hidden: ({ parent }) => parent?.kind !== 'emailCard' }),
        str('rolesEyebrow', { title: 'Roles eyebrow', hidden: ({ parent }) => parent?.kind !== 'roles' }),
        items(
          'roles',
          [
            str('title', { title: 'Role title', required: true }),
            str('meta', { title: 'Location and type', description: 'For example "Remote · Part time".' }),
            txt('note', { title: 'Note', rows: 2 }),
            link('link', { title: 'Link to the job post' }),
          ],
          {
            title: 'Open roles',
            itemTitle: 'Role',
            description: 'Leave empty to show only the talent community form.',
            hidden: ({ parent }) => parent?.kind !== 'roles',
            preview: { select: { title: 'title', subtitle: 'meta' } },
          },
        ),
      ],
      { title: 'Side content', fieldset: 'side' },
    ),
    str('submitLabel', { title: 'Send button text' }),
    str('footnote', { title: 'Note beside the button', description: 'For example "Pricing is shared after the conversation."' }),
    txt('consentText', { title: 'Consent wording', rows: 3, description: 'Optional, unticked box for text and email consent. [Counsel to review.] Must match the wording registered for text messages.' }),
    strings('subjectOptions', { title: 'Subject choices', description: 'Contact form only. The first one starts selected.', hidden: ({ parent }) => parent?.form !== 'contact' }),
    strings('selectOptions', {
      title: 'Size choices',
      description: 'Partner form: company sizes. Speaking form: audience sizes.',
      hidden: ({ parent }) => !['partner', 'speaking'].includes(parent?.form),
    }),
    str('successTitle', { title: 'Success headline', fieldset: 'success' }),
    txt('successBody', { title: 'Success message', rows: 2, fieldset: 'success', description: PLACEHOLDER_HELP }),
    str('successCtaLabel', { title: 'Success button text', fieldset: 'success' }),
  ],
  fallbackTitle: 'Form',
})

export const episodes = defineSection({
  name: 'episodes',
  title: 'Podcast episodes',
  icon: MicrophoneIcon,
  defaultBackground: 'paper',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    items(
      'items',
      [
        str('number', { title: 'Episode number', description: 'For example "03".' }),
        str('guest', { title: 'Guest' }),
        str('title', { title: 'Episode title', required: true }),
        txt('summary', { title: 'One-line summary', rows: 2 }),
        defineField({ name: 'spotifyUrl', title: 'Spotify link', type: 'url' }),
        defineField({ name: 'youtubeUrl', title: 'YouTube link', type: 'url' }),
      ],
      { title: 'Episodes', itemTitle: 'Episode', description: 'Newest first.', preview: { select: { title: 'title', subtitle: 'guest' } } },
    ),
  ],
})

export const socialFeed = defineSection({
  name: 'socialFeed',
  title: 'Social posts',
  icon: StarIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    items(
      'cards',
      [
        list(
          'style',
          [
            { title: 'Navy with logo', value: 'logoLine' },
            { title: 'Lavender quote', value: 'quote' },
            { title: 'Orange decision rule', value: 'rule' },
            { title: 'Paper with big type', value: 'big' },
          ],
          { title: 'Card style', initialValue: 'logoLine' },
        ),
        str('eyebrow', { title: 'Eyebrow or big line', description: 'Decision rule cards: the eyebrow. Big type cards: the big line, for example "1 → 365".' }),
        accent('text', { title: 'Main text', rows: 2 }),
        str('caption', { title: 'Caption' }),
      ],
      { title: 'Cards', itemTitle: 'Card', preview: { select: { title: 'text', subtitle: 'style' } } },
    ),
  ],
})

export const richText = defineSection({
  name: 'richText',
  title: 'Text',
  icon: DocumentTextIcon,
  description: 'A heading and formatted text in a readable column.',
  fields: [str('eyebrow', { title: 'Eyebrow' }), accent('headline', { title: 'Headline' }), defineField({ name: 'body', title: 'Text', type: 'richBody' })],
  fallbackTitle: 'Text',
})

export const imageText = defineSection({
  name: 'imageText',
  title: 'Image and text',
  icon: ImageIcon,
  fields: [
    image('image', { title: 'Image', required: true }),
    list(
      'imageSide',
      [
        { title: 'Image on the left', value: 'left' },
        { title: 'Image on the right', value: 'right' },
      ],
      { title: 'Image side', initialValue: 'left', layout: 'radio' },
    ),
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    defineField({ name: 'body', title: 'Text', type: 'richBody' }),
    cta('cta', { title: 'Button' }),
  ],
})

export const linkCards = defineSection({
  name: 'linkCards',
  title: 'Quick links',
  icon: ListIcon,
  titleField: 'items.0.title',
  fallbackTitle: 'Quick links',
  fields: [
    items('items', [str('eyebrow', { title: 'Eyebrow' }), str('title', { title: 'Title', required: true }), link('link', { title: 'Link' })], {
      title: 'Cards',
      itemTitle: 'Card',
      preview: { select: { title: 'title', subtitle: 'eyebrow' } },
    }),
  ],
})

export const profileBio = defineSection({
  name: 'profileBio',
  title: 'Biography',
  icon: BlockContentIcon,
  description: 'A bold intro, the full biography, a navy quote card and a small "Now" card.',
  titleField: 'intro',
  fields: [
    txt('intro', { title: 'Intro (bold)', rows: 3 }),
    defineField({ name: 'body', title: 'Biography', type: 'richBody' }),
    txt('quote', { title: 'Quote', rows: 2 }),
    str('signature', { title: 'Signature', description: 'Handwritten name under the quote.' }),
    str('asideEyebrow', { title: 'Small card eyebrow' }),
    str('asideText', { title: 'Small card text' }),
  ],
  fallbackTitle: 'Biography',
})

export const mediaBand = defineSection({
  name: 'mediaBand',
  title: 'Media and press',
  icon: BulbOutlineIcon,
  defaultBackground: 'ink',
  titleField: 'text',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    txt('text', { title: 'Statement', rows: 3 }),
    items('links', [str('label', { title: 'Button text', required: true }), defineField({ name: 'url', title: 'Link', type: 'url' })], {
      title: 'Press links',
      itemTitle: 'Press link',
      preview: { select: { title: 'label', subtitle: 'url' } },
    }),
    cta('cta', { title: 'Button' }),
  ],
})

export const growthCallCta = defineSection({
  name: 'growthCallCta',
  title: 'Growth call link',
  icon: CalendarIcon,
  description: 'A short line with a link to the growth strategy call page (/growth-strategy).',
  titleField: 'line',
  fallbackTitle: 'Growth call link',
  fields: [
    str('line', { title: 'Line', description: 'For example "Not sure the in-person workshop fits?"' }),
    str('linkLabel', { title: 'Link text', required: true, description: 'For example "Book a growth strategy call".' }),
  ],
})

export const sectionTypes = [
  heroFounder,
  ticker,
  methodCalendar,
  howItWorks,
  offerGrid,
  assessmentCta,
  statsBlock,
  testimonials,
  founderStory,
  faqBlock,
  finalCta,
  pageHero,
  statement,
  valuesGrid,
  timeline,
  teamGrid,
  ctaPanels,
  gallery,
  formSection,
  episodes,
  socialFeed,
  richText,
  imageText,
  linkCards,
  profileBio,
  mediaBand,
  growthCallCta,
]

export const SECTION_TYPES = sectionTypes.map((s) => s.name)

export const SECTION_INSERT_GROUPS = [
  { name: 'openings', title: 'Page openings', of: ['pageHero', 'heroFounder'] },
  { name: 'text', title: 'Text and story', of: ['statement', 'richText', 'imageText', 'profileBio', 'valuesGrid', 'timeline', 'teamGrid'] },
  { name: 'offers', title: 'Offers and calls to action', of: ['offerGrid', 'assessmentCta', 'finalCta', 'ctaPanels', 'linkCards', 'mediaBand', 'growthCallCta'] },
  { name: 'proof', title: 'Proof', of: ['statsBlock', 'testimonials', 'founderStory', 'gallery'] },
  { name: 'method', title: 'The method', of: ['methodCalendar', 'howItWorks', 'ticker'] },
  { name: 'forms', title: 'Questions and forms', of: ['faqBlock', 'formSection'] },
  { name: 'media', title: 'Media', of: ['episodes', 'socialFeed'] },
]
