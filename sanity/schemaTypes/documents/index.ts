import { BarChartIcon } from '@sanity/icons/BarChart'
import { CommentIcon } from '@sanity/icons/Comment'
import { DocumentIcon } from '@sanity/icons/Document'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { PlayIcon } from '@sanity/icons/Play'
import { TimelineIcon } from '@sanity/icons/Timeline'
import { TransferIcon } from '@sanity/icons/Transfer'
import { UserIcon } from '@sanity/icons/User'
import { ComposeIcon } from '@sanity/icons/Compose'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { SECTION_TYPES, SECTION_INSERT_GROUPS } from '../sections'
import { bool, image, link, num, PLACEHOLDER_HELP, ref, refs, seo, slug, str, strings, txt } from '../helpers'
import { sale } from './sale'

/* ---------------- page (page builder) ---------------- */

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Sections', default: true },
    { name: 'settings', title: 'Page settings' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    str('title', { title: 'Page name', required: true, group: 'settings', description: 'Used in the Studio, breadcrumbs and as the browser tab title when the SEO title is empty.' }),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      group: 'settings',
      description: 'The address after reelgoodnews.com/, for example "about" or "about/jenna-colombo". The home page uses "home".',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9/\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^\/+|\/+$/g, ''),
      },
      validation: (Rule) =>
        Rule.required().custom((value: { current?: string } | undefined) => {
          const s = value?.current ?? ''
          if (!s) return true
          if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(s)) return 'Use lowercase letters, numbers, hyphens and single slashes, with no slash at the start or end.'
          const reserved = ['workshop', 'courses', 'book', 'assessment', 'order', 'blog', 'legal', 'studio', 'api']
          if (reserved.includes(s.split('/')[0]) ) return `"${s.split('/')[0]}" is used by a built-in page. Pick another address.`
          return true
        }),
    }),
    bool('hidden', {
      title: 'Hide this page',
      group: 'settings',
      description: 'Hidden pages show "page not found" and drop out of the menus, the footer and the sitemap. Use it for the podcast page until the show launches.',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Build the page from ready-made Reel Good News sections. Drag to reorder. Hide a section from its "Layout and visibility" settings.',
      of: SECTION_TYPES.map((type) => defineArrayMember({ type })),
      options: {
        insertMenu: {
          groups: SECTION_INSERT_GROUPS,
          views: [{ name: 'list' }],
        },
      },
    }),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', hidden: 'hidden' },
    prepare({ title, slug: s, hidden }) {
      return {
        title: title || 'Untitled page',
        subtitle: `${s === 'home' ? '/' : `/${s ?? ''}`}${hidden ? ' · hidden' : ''}`,
        media: DocumentIcon,
      }
    },
  },
})

/* ---------------- course ---------------- */

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: PlayIcon,
  orderings: [orderRankOrdering, { title: 'Course order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  groups: [
    { name: 'basics', title: 'Basics', default: true },
    { name: 'prices', title: 'Prices' },
    { name: 'page', title: 'Course page' },
    { name: 'faq', title: 'FAQ' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    orderRankField({ type: 'course', hidden: true }),
    num('order', { title: 'Order', group: 'basics', integer: true, hidden: true, description: 'Older ordering. Drag courses in the Courses list to reorder them.' }),
    str('title', { title: 'Short title', required: true, group: 'basics', max: 60, description: 'Used on cards and in menus, for example "Attract the Right Audience".' }),
    str('fullTitle', { title: 'Full title', group: 'basics', max: 100, description: 'The page headline, for example "Attract the Right Audience: Nail Your Go-to-Market Strategy First".' }),
    slug('slug', { group: 'basics', description: 'The address after /courses/, for example "attract-the-right-audience".' }),
    str('word', { title: 'Handwritten word', group: 'basics', max: 14, description: 'The handwritten label on the course cover, for example "Attract".' }),
    str('stepNumber', { title: 'Step on the path', group: 'basics', description: 'Two digits: "01" Attract, "03" Create, "04" Broadcast. Step 02 is the live workshop.' }),
    num('courseNumber', { title: 'Course number', group: 'basics', integer: true, description: '1, 2 or 3. Shown as "Course 1" on the path bar.' }),
    txt('headline', { title: 'Subheadline', group: 'basics', rows: 2, max: 120, description: 'The line under the page title.' }),
    txt('summary', { title: 'Card summary', group: 'basics', rows: 3, max: 200, description: 'Two short sentences for the course card on the home page.' }),
    str('shortLine', { title: 'Menu line', group: 'basics', max: 60, description: 'Shown in the Education menu before the price, for example "Nail your go-to-market strategy first".' }),
    num('regularPrice', {
      title: 'Regular price (USD)',
      group: ['basics', 'prices'],
      required: true,
      description: 'Charged after the intro period ends. All prices are also on the "Prices & sales" screen.',
    }),
    num('introPrice', { title: 'Introductory price (USD)', group: ['basics', 'prices'], description: 'Charged until the intro period ends. Leave empty for no intro price.' }),
    bool('inBundle', {
      title: 'Part of the Content Machine bundle',
      group: ['basics', 'prices'],
      initialValue: false,
      description: 'Ticked courses are listed on the bundle page and counted in its "bought separately" totals.',
    }),
    str('problemLabel', { title: 'Statement label', group: 'page', description: 'For example "The problem" or "Who it is for".' }),
    txt('problem', { title: 'Statement', group: 'page', rows: 3, max: 260 }),
    str('problemHighlight', { title: 'Highlighted phrase', group: 'page', description: 'Copy a phrase exactly from the statement to give it the lavender highlight.' }),
    strings('learn', { title: 'What the course covers', group: 'page', description: 'One lesson theme per line. The last tile shows in lavender.' }),
    txt('outcome', { title: 'The outcome', group: 'page', rows: 3, max: 220 }),
    txt('outcomeNote', { title: 'Outcome note', group: 'page', rows: 2 }),
    str('bestFor', { title: 'Best for', group: 'page' }),
    str('format', { title: 'Format', group: 'page', description: 'For example "On-demand online lessons".' }),
    str('opensLabel', { title: 'Opens', group: 'page', description: 'For example "December 1, 2026".' }),
    str('hostedOn', { title: 'Hosted on', group: 'page', description: PLACEHOLDER_HELP }),
    refs('faqs', ['faq'], { title: 'Questions', group: 'faq', description: 'Pick FAQs from the Library. Drag to reorder.' }),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', step: 'stepNumber', intro: 'introPrice', regular: 'regularPrice' },
    prepare({ title, step, intro, regular }) {
      return {
        title: title || 'Course',
        subtitle: [step ? `Step ${step}` : '', intro ? `$${intro} intro` : '', regular ? `$${regular}` : ''].filter(Boolean).join(' · '),
        media: PlayIcon,
      }
    },
  },
})

/* ---------------- post ---------------- */

export const TOPICS = [
  { title: 'Offers', value: 'OFFERS' },
  { title: 'Content', value: 'CONTENT' },
  { title: 'Positioning', value: 'POSITIONING' },
  { title: 'Growth', value: 'GROWTH' },
  { title: 'Measurement', value: 'MEASUREMENT' },
]

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: ComposeIcon,
  groups: [
    { name: 'content', title: 'Post', default: true },
    { name: 'details', title: 'Details' },
    { name: 'seo', title: 'SEO' },
  ],
  orderings: [
    { title: 'Number', name: 'numberAsc', by: [{ field: 'number', direction: 'asc' }] },
    { title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  fields: [
    str('title', { title: 'Title', required: true, max: 110, group: 'content' }),
    slug('slug', { group: 'details', description: 'The address after /blog/. Generate it from the title.' }),
    str('number', { title: 'Number', group: 'details', description: 'Two digits, for example "11". Shown as "NO. 11" on the card and sets the order on the blog page.' }),
    str('coverLine', { title: 'Cover words', group: 'content', max: 40, description: 'Two to four words for the coloured cover, for example "Boring wins."' }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      group: 'details',
      options: { list: TOPICS, layout: 'radio', direction: 'horizontal' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Feature this post',
      type: 'boolean',
      group: 'details',
      initialValue: false,
      description: 'The featured post shows as the large ticket at the top of the blog page. Only one post can be featured at a time.',
      validation: (Rule) =>
        Rule.custom(async (value, ctx) => {
          if (!value) return true
          const id = (ctx.document?._id ?? '').replace(/^drafts\./, '')
          const client = ctx.getClient({ apiVersion: '2026-11-04' })
          const others = await client.fetch<number>(
            'count(*[_type == "post" && featured == true && !(_id in [$id, $draft]) && !(_id in path("drafts.**"))])',
            { id, draft: `drafts.${id}` },
          )
          return others > 0 ? 'Another post is already featured. Untick it there first.' : true
        }),
    }),
    ref('author', ['teamMember'], { title: 'Author', group: 'details', description: 'Pick a team member. Their photo shows beside the post.' }),
    defineField({ name: 'publishedAt', title: 'Publish date', type: 'datetime', group: 'details', initialValue: () => new Date().toISOString() }),
    txt('excerpt', { title: 'Excerpt', group: 'content', rows: 3, max: 220, description: 'Optional. Shown on the blog card. Defaults to the first paragraph.' }),
    defineField({ name: 'body', title: 'Post', type: 'postBody', group: 'content' }),
    txt('sources', { title: 'Sources', group: 'content', rows: 3, description: 'Shown in small text at the end of the post.' }),
    seo('seo'),
  ],
  preview: {
    select: { title: 'title', number: 'number', topic: 'topic', featured: 'featured' },
    prepare({ title, number, topic, featured }) {
      return {
        title: title || 'Untitled post',
        subtitle: [number ? `No. ${number}` : '', topic, featured ? 'Featured' : ''].filter(Boolean).join(' · '),
        media: ComposeIcon,
      }
    },
  },
})

/* ---------------- library ---------------- */

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    str('question', { title: 'Question', required: true, max: 140 }),
    txt('answer', { title: 'Answer', required: true, rows: 4 }),
    strings('tags', {
      title: 'Where it fits',
      description: 'Labels to help find the question. Pages show the questions picked in their FAQ section.',
      list: [
        { title: 'Home', value: 'home' },
        { title: 'Workshop', value: 'workshop' },
        { title: 'Course', value: 'course' },
        { title: 'Bundle', value: 'bundle' },
      ],
    }),
  ],
  preview: {
    select: { title: 'question', tags: 'tags' },
    prepare: ({ title, tags }) => ({ title, subtitle: (tags ?? []).join(', '), media: HelpCircleIcon }),
  },
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    txt('quote', { title: 'Quote', required: true, rows: 3 }),
    str('name', { title: 'Name', required: true }),
    str('company', { title: 'Company' }),
    defineField({
      name: 'permissionConfirmed',
      title: 'Written permission received',
      type: 'boolean',
      initialValue: false,
      description: 'Every quote needs the person\'s written permission before it goes live. Tick this box once it is on file.',
      validation: (Rule) =>
        Rule.custom((value) => (value === true ? true : 'Get written permission from this person, then tick the box. Quotes without permission cannot be published.')),
    }),
  ],
  preview: {
    select: { name: 'name', company: 'company', quote: 'quote', ok: 'permissionConfirmed' },
    prepare: ({ name, company, quote, ok }) => ({
      title: `${name ?? 'Testimonial'}${company ? `, ${company}` : ''}`,
      subtitle: `${ok ? '' : 'Permission pending · '}${quote ?? ''}`,
      media: CommentIcon,
    }),
  },
})

export const stat = defineType({
  name: 'stat',
  title: 'Proof number',
  type: 'document',
  icon: BarChartIcon,
  fields: [
    num('value', { title: 'Number', required: true, description: 'Digits only. It counts up when it scrolls into view.' }),
    str('prefix', { title: 'Before the number', description: 'For example "$".' }),
    str('suffix', { title: 'After the number', description: 'For example "+", "M+" or "K+". A plus sign shows in the accent colour.' }),
    str('label', { title: 'Label', required: true, description: 'For example "high-tech founders coached".' }),
    str('footnote', { title: 'Footnote', description: 'Optional.' }),
  ],
  preview: {
    select: { value: 'value', prefix: 'prefix', suffix: 'suffix', label: 'label' },
    prepare: ({ value, prefix, suffix, label }) => ({ title: `${prefix ?? ''}${value ?? ''}${suffix ?? ''}`, subtitle: label, media: BarChartIcon }),
  },
})

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  icon: UserIcon,
  fields: [
    str('name', { title: 'Name', required: true }),
    str('title', { title: 'Role', description: 'For example "Founder".' }),
    image('photo', { title: 'Photo', description: 'A square or portrait photo. Used for the author line on blog posts and course pages.' }),
    image('cutout', { title: 'Cut-out photo', description: 'Optional. A photo with a transparent background, shown on the team card over the spinning reel.' }),
    txt('bio', { title: 'Short bio', rows: 4 }),
    link('link', { title: 'Profile page', description: 'Optional. Where the team card button goes, for example the founder page.' }),
    str('linkLabel', { title: 'Button text', description: 'For example "About Jenna".' }),
    num('order', { title: 'Order', integer: true, description: 'Lower numbers show first.' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'title', media: 'photo' } },
})

export const timelineEntry = defineType({
  name: 'timelineEntry',
  title: 'Timeline entry',
  type: 'document',
  icon: TimelineIcon,
  fields: [
    str('organisation', { title: 'Organisation', required: true }),
    str('years', { title: 'Years (full)', description: 'For the founder page record cards, for example "2013 to present".' }),
    str('year', { title: 'Year', description: 'For the About page timeline, for example "2013".' }),
    str('homeLabel', { title: 'Home page label', description: 'For the home founder story, for example "2013 →".' }),
    txt('description', { title: 'Description', rows: 3, description: 'Used on the founder page.' }),
    txt('shortDescription', { title: 'About page description', rows: 2, description: 'Optional. Uses the description when empty.' }),
    str('homeSummary', { title: 'Home page summary', description: 'One short line for the home founder story.' }),
    bool('highlight', { title: 'Highlight', description: 'Shows the timeline dot in orange.' }),
    num('order', { title: 'Order', integer: true }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'organisation', subtitle: 'years' } },
})

/* ---------------- legal and redirects ---------------- */

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    str('title', { title: 'Title', required: true }),
    str('navLabel', { title: 'Side menu label', description: 'Optional. Uses the title when empty.' }),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      description: 'The address after /legal/: privacy, terms, dmca or do-not-sell.',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    num('order', { title: 'Order in the side menu', integer: true }),
    str('lastUpdated', { title: 'Last updated', description: 'For example "March 3, 2027". ' + PLACEHOLDER_HELP }),
    bool('templateBanner', {
      title: 'Counsel-reviewed text pending',
      initialValue: true,
      description: 'Shows the "Template" notice at the top of the page. Untick it once counsel approves the final text.',
    }),
    txt('templateBannerText', { title: 'Notice text', rows: 2, hidden: ({ parent }) => !parent?.templateBanner }),
    defineField({ name: 'body', title: 'Text', type: 'richBody' }),
    seo(),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', slug: 'slug.current', pending: 'templateBanner' },
    prepare: ({ title, slug: s, pending }) => ({ title, subtitle: `/legal/${s ?? ''}${pending ? ' · counsel review pending' : ''}`, media: DocumentTextIcon }),
  },
})

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: TransferIcon,
  description: 'Sends visitors from an old address to a new one. Changes go live with the next deploy.',
  fields: [
    defineField({
      name: 'from',
      title: 'From',
      type: 'string',
      description: 'The old address on this domain, starting with /, for example /old-page.',
      validation: (Rule) =>
        Rule.required().custom((v: string | undefined) => (!v || v.startsWith('/') ? true : 'Start with /')),
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'string',
      description: 'The new address: a path starting with / or a full https:// address.',
      validation: (Rule) =>
        Rule.required().custom((v: string | undefined) => (!v || v.startsWith('/') || /^https?:\/\//.test(v) ? true : 'Start with / or https://')),
    }),
    defineField({
      name: 'permanent',
      title: 'Permanent',
      type: 'boolean',
      initialValue: true,
      description: 'Leave on for pages that moved for good. It tells Google to use the new address.',
    }),
  ],
  preview: {
    select: { from: 'from', to: 'to', permanent: 'permanent' },
    prepare: ({ from, to, permanent }) => ({ title: `${from ?? ''} → ${to ?? ''}`, subtitle: permanent === false ? 'Temporary' : 'Permanent', media: TransferIcon }),
  },
})

export const documentTypes = [page, course, sale, post, faq, testimonial, stat, teamMember, timelineEntry, legalPage, redirect]

