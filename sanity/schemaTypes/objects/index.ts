import { BlockquoteIcon } from '@sanity/icons/Blockquote'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { ImageIcon } from '@sanity/icons/Image'
import { LinkIcon } from '@sanity/icons/Link'
import { SearchIcon } from '@sanity/icons/Search'

import { defineArrayMember, defineField, defineType } from 'sanity'
import { CTA_STYLES } from '../helpers'

/** Everything a link can point to inside the site. */
export const LINK_TARGET_TYPES = [
  'page',
  'course',
  'workshop',
  'bundle',
  'book',
  'assessment',
  'post',
  'legalPage',
  'blogSettings',
]

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'kind',
      title: 'Link to',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          { title: 'A page on this site', value: 'internal' },
          { title: 'Another website, email or phone', value: 'external' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'reference',
      to: LINK_TARGET_TYPES.map((type) => ({ type })),
      description: 'Pick the page. The link updates by itself if the page address changes. Links to hidden pages disappear from the site.',
      hidden: ({ parent }) => parent?.kind === 'external',
    }),
    defineField({
      name: 'external',
      title: 'Web address',
      type: 'url',
      description: 'A full address starting with https://, or mailto: for email, or tel: for a phone number.',
      hidden: ({ parent }) => parent?.kind !== 'external',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'anchor',
      title: 'Jump to section',
      type: 'string',
      description: 'Optional. The anchor ID of a section, for example "apply". Leave the page empty to jump within the same page.',
      validation: (Rule) => Rule.regex(/^[a-z0-9-]+$/, { name: 'lowercase letters, numbers and hyphens' }),
    }),
    defineField({
      name: 'newTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value: { kind?: string; internal?: unknown; external?: string; anchor?: string } | undefined) => {
      if (!value) return true
      if (value.kind === 'external' && !value.external) return 'Add the web address.'
      if (value.kind !== 'external' && !value.internal && !value.anchor) return 'Pick a page or a section to jump to.'
      return true
    }).warning(),
  preview: {
    select: { kind: 'kind', title: 'internal.title', slug: 'internal.slug.current', type: 'internal._type', external: 'external', anchor: 'anchor' },
    prepare({ kind, title, slug, type, external, anchor }) {
      const hash = anchor ? `#${anchor}` : ''
      if (kind === 'external') return { title: external || 'No address yet', subtitle: 'External link', media: LinkIcon }
      return { title: (title || slug || type || 'Same page') + hash, subtitle: type ? `Links to ${type}` : 'Internal link', media: LinkIcon }
    },
  },
})

export const cta = defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', title: 'Button text', type: 'string', validation: (Rule) => [Rule.required(), Rule.max(48).warning('Short button text reads best.')] }),
    defineField({ name: 'link', title: 'Link', type: 'link' }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      initialValue: 'primary',
      options: { list: CTA_STYLES, layout: 'dropdown' },
    }),
  ],
  preview: {
    select: { title: 'label', style: 'style', target: 'link.internal.title', external: 'link.external' },
    prepare({ title, style, target, external }) {
      return { title: title || 'Button', subtitle: [style, target || external].filter(Boolean).join(' · '), media: LinkIcon }
    },
  },
})

export const simpleLink = defineType({
  name: 'simpleLink',
  title: 'Menu link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'link', title: 'Link', type: 'link' }),
  ],
  preview: {
    select: { title: 'label', target: 'link.internal.title', external: 'link.external' },
    prepare({ title, target, external }) {
      return { title: title || 'Link', subtitle: target || external, media: LinkIcon }
    },
  },
})

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe what the image shows for people who use screen readers, for example "Jenna Colombo, founder of Reel Good News."',
      validation: (Rule) =>
        Rule.custom((alt, ctx) => {
          const parent = ctx.parent as { asset?: unknown } | undefined
          if (parent?.asset && !alt) return 'Add alternative text. It is required for accessibility.'
          return true
        }),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string', description: 'Optional. Shown under the image where the design has a caption.' }),
  ],
})

export const seo = defineType({
  name: 'seo',
  title: 'Search and sharing',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Search title',
      type: 'string',
      description: 'The title in Google results and browser tabs. "· Reel Good News" is added after it. Aim for under 60 characters.',
      validation: (Rule) => Rule.max(60).warning('Google cuts titles longer than about 60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Search description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences for Google results and link previews. Aim for under 160 characters.',
      validation: (Rule) => Rule.max(160).warning('Google cuts descriptions longer than about 160 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Sharing image',
      type: 'image',
      description: 'Shown when the page is shared on LinkedIn and other sites. Best at 1200 x 630 pixels. Leave empty to use the default.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'titleTemplate',
      title: 'Title pattern',
      type: 'string',
      description: 'How every page title is built. %s stands for the page title, for example "%s · Reel Good News".',
      hidden: ({ document }) => document?._type !== 'siteSettings',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Keeps this page out of Google and the sitemap. The page still works for anyone with the link.',
      initialValue: false,
      hidden: ({ document }) => document?._type === 'siteSettings',
    }),
  ],
})

/* ---------------- portable text ---------------- */

const blockMember = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Paragraph', value: 'normal' },
    { title: 'Heading', value: 'h2' },
    { title: 'Small heading', value: 'h3' },
  ],
  lists: [
    { title: 'Bullets', value: 'bullet' },
    { title: 'Numbers', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Italic', value: 'em' },
    ],
    annotations: [
      {
        // Named "inlineLink", not "link": the site gives every `link` object a computed href.
        name: 'inlineLink',
        title: 'Link',
        type: 'object',
        icon: LinkIcon,
        fields: [
          defineField({
            name: 'href',
            title: 'Address',
            type: 'url',
            description: 'A page on this site starting with / (for example /contact), or a full address starting with https://.',
            validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }).required(),
          }),
        ],
      },
    ],
  },
})

export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [defineField({ name: 'text', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required() })],
  preview: {
    select: { text: 'text' },
    prepare: ({ text }) => ({ title: text || 'Pull quote', subtitle: 'Pull quote', media: BlockquoteIcon }),
  },
})

export const decisionRule = defineType({
  name: 'decisionRule',
  title: 'Decision rule',
  type: 'object',
  icon: BulbOutlineIcon,
  description: 'The navy box that closes each post.',
  fields: [defineField({ name: 'text', title: 'Rule', type: 'text', rows: 3, validation: (Rule) => Rule.required() })],
  preview: {
    select: { text: 'text' },
    prepare: ({ text }) => ({ title: text || 'Decision rule', subtitle: 'Decision rule', media: BulbOutlineIcon }),
  },
})

export const richBody = defineType({
  name: 'richBody',
  title: 'Text',
  type: 'array',
  of: [blockMember],
})

export const postBody = defineType({
  name: 'postBody',
  title: 'Post text',
  type: 'array',
  of: [blockMember, defineArrayMember({ type: 'pullQuote' }), defineArrayMember({ type: 'decisionRule' })],
})

export const objectTypes = [link, cta, simpleLink, imageWithAlt, seo, pullQuote, decisionRule, richBody, postBody]

