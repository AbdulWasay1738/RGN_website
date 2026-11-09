import { TagIcon } from '@sanity/icons/Tag'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { bool, link, str, txt } from '../helpers'

const TIME_HELP =
  'Shown and saved in your computer\'s time zone. Eastern Time example: a sale "through November 30" ends on December 1 at 12:00 AM.'

/** Live now, scheduled or ended, for lists in the Studio. */
export function saleStatus(startsAt?: string, endsAt?: string, enabled?: boolean, now = new Date()) {
  if (enabled === false) return 'Turned off'
  if (!startsAt || !endsAt) return 'Dates missing'
  if (now < new Date(startsAt)) return 'Scheduled'
  if (now < new Date(endsAt)) return 'Live now'
  return 'Ended'
}

const dateLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET' : '?'

/**
 * A scheduled sale, for example Black Friday. Between its start and end the
 * listed courses, workshop or bundle sell at the sale price everywhere on the
 * site (cards, course pages, menus, checkout), and its banner replaces the
 * regular one. Nothing needs publishing on the day: it switches on and off by itself.
 */
export const sale = defineType({
  name: 'sale',
  title: 'Sale',
  type: 'document',
  icon: TagIcon,
  fields: [
    str('title', { title: 'Sale name', required: true, max: 40, description: 'For example "Black Friday sale". Visitors see it beside the sale prices and in the countdown.' }),
    bool('enabled', { title: 'Sale is on', initialValue: true, description: 'Untick to cancel the sale without deleting it.' }),
    defineField({
      name: 'startsAt',
      title: 'Starts',
      type: 'datetime',
      description: TIME_HELP,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends',
      type: 'datetime',
      description: 'The moment sale prices stop. ' + TIME_HELP,
      validation: (Rule) =>
        Rule.required().custom((value, ctx) => {
          const start = (ctx.document as { startsAt?: string } | undefined)?.startsAt
          if (value && start && new Date(value) <= new Date(start)) return 'The end must be after the start.'
          return true
        }),
    }),
    defineField({
      name: 'items',
      title: 'Sale prices',
      type: 'array',
      description: 'Pick each course, the workshop or the bundle, and its price during the sale. Anything not listed keeps its usual price.',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((items: Array<{ offer?: { _ref?: string } }> | undefined) => {
            const ids = (items ?? []).map((i) => i.offer?._ref).filter(Boolean)
            return new Set(ids).size === ids.length ? true : 'Each offer can only be listed once.'
          }),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'itemsItem',
          title: 'Sale price',
          fields: [
            defineField({
              name: 'offer',
              title: 'Course, workshop or bundle',
              type: 'reference',
              to: [{ type: 'course' }, { type: 'workshop' }, { type: 'bundle' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'salePrice',
              title: 'Sale price (USD)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: { title: 'offer.title', price: 'salePrice' },
            prepare: ({ title, price }) => ({ title: title || 'Pick an offer', subtitle: typeof price === 'number' ? `$${price} during the sale` : 'No price yet' }),
          },
        }),
      ],
    }),
    str('priceLabel', {
      title: 'Label beside sale prices',
      max: 30,
      description: 'For example "Black Friday price". Leave empty to show the saving, for example "Save $100".',
    }),
    defineField({
      name: 'banner',
      title: 'Banner during the sale',
      type: 'object',
      description: 'The dark strip above the header. While the sale is on, this replaces the regular banner.',
      options: { collapsible: true, collapsed: false },
      fields: [
        bool('show', { title: 'Show a banner', initialValue: true }),
        str('label', { title: 'Small label', max: 20, description: 'For example "BLACK FRIDAY".' }),
        txt('message', { title: 'Message', rows: 2, max: 120, description: 'For example "All courses are 20% off until Monday."' }),
        str('ctaLabel', { title: 'Link text', description: 'For example "See the courses".' }),
        link('ctaLink', { title: 'Link to' }),
      ],
    }),
  ],
  orderings: [{ title: 'Start date, newest first', name: 'startsDesc', by: [{ field: 'startsAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', startsAt: 'startsAt', endsAt: 'endsAt', enabled: 'enabled' },
    prepare: ({ title, startsAt, endsAt, enabled }) => ({
      title: title || 'New sale',
      subtitle: `${saleStatus(startsAt, endsAt, enabled)} · ${dateLabel(startsAt)} to ${dateLabel(endsAt)}`,
      media: TagIcon,
    }),
  },
})
