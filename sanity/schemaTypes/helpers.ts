/**
 * Shared schema helpers. Field names must match lib/sanity/types.ts exactly.
 *
 * Array member rule (shared with the seed): every array of inline objects uses
 * a member type named `${fieldName}Item`. Arrays of CTAs use `cta`, arrays of
 * {label, link} use `simpleLink`, image arrays use `imageWithAlt`.
 */
import type { ComponentType } from 'react'
import {
  defineArrayMember,
  defineField,
  defineType,
  type FieldDefinition,
  type PreviewConfig,
  type StringRule,
} from 'sanity'

/* ---------------- shared help text ---------------- */

export const ACCENT_HELP =
  'Wrap words in *asterisks* to colour them, for example "Choose a *starting point.*" The font stays the same.'

export const PLACEHOLDER_HELP = 'Text in [square brackets] is a placeholder. Replace it when the detail is final.'

/* ---------------- option lists ---------------- */

export const BACKGROUNDS = [
  { title: 'White', value: 'white' },
  { title: 'Paper (warm off-white)', value: 'paper' },
  { title: 'Navy (street texture)', value: 'navy' },
  { title: 'Ink (darkest, street texture)', value: 'ink' },
  { title: 'Lavender', value: 'lavender' },
  { title: 'Lavender tint (pale)', value: 'lavender-tint' },
  { title: 'Orange', value: 'orange' },
]

export const WATERMARKS = [
  { title: 'None', value: 'none' },
  { title: 'Top right', value: 'top-right' },
  { title: 'Top left', value: 'top-left' },
  { title: 'Bottom left', value: 'bottom-left' },
  { title: 'Bottom right', value: 'bottom-right' },
  { title: 'Centre right', value: 'center-right' },
]

export const CTA_STYLES = [
  { title: 'Primary (orange)', value: 'primary' },
  { title: 'Dark (navy)', value: 'dark' },
  { title: 'Outline (navy line)', value: 'outline' },
  { title: 'Outline on dark backgrounds', value: 'outlineLight' },
  { title: 'White', value: 'white' },
  { title: 'Text link with arrow', value: 'textLink' },
]

export const ICONS = [
  { title: 'Arrow', value: 'arrow' },
  { title: 'Calendar', value: 'calendar' },
  { title: 'Clock', value: 'clock' },
  { title: 'Location pin', value: 'pin' },
  { title: 'Lock', value: 'lock' },
  { title: 'Phone', value: 'phone' },
  { title: 'People', value: 'people' },
  { title: 'Target', value: 'target' },
  { title: 'Camera', value: 'camera' },
  { title: 'Film', value: 'film' },
  { title: 'Broadcast', value: 'broadcast' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Check mark', value: 'check' },
  { title: 'Email', value: 'mail' },
]

/* ---------------- small field builders ---------------- */

type FieldOpts = {
  title?: string
  description?: string
  required?: boolean
  max?: number
  rows?: number
  group?: string | string[]
  fieldset?: string
  hidden?: FieldDefinition['hidden']
  initialValue?: unknown
}

/** Required is an error; a max length is a warning, so long text still saves. */
function rules(opts: FieldOpts) {
  if (!opts.required && !opts.max) return undefined
  return (Rule: StringRule) => {
    const out: StringRule[] = []
    if (opts.required) out.push(Rule.required())
    if (opts.max) out.push(Rule.max(opts.max).warning(`Keep this under ${opts.max} characters so it fits the design.`))
    return out
  }
}

/** A short single-line string. */
export function str(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'string',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    initialValue: opts.initialValue as string | undefined,
    validation: rules(opts) as never,
  })
}

/** Multi-line plain text. */
export function txt(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'text',
    rows: opts.rows ?? 3,
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    validation: rules(opts) as never,
  })
}

/** A headline where *asterisks* mark accent words. */
export function accent(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: opts.rows ? 'text' : 'string',
    ...(opts.rows ? { rows: opts.rows } : {}),
    description: [opts.description, ACCENT_HELP].filter(Boolean).join(' '),
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    validation: rules({ ...opts, max: opts.max ?? 160 }) as never,
  })
}

export function num(name: string, opts: FieldOpts & { min?: number; integer?: boolean } = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'number',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    initialValue: opts.initialValue as number | undefined,
    validation: (Rule) => {
      let r = Rule.min(opts.min ?? 0)
      if (opts.integer) r = r.integer()
      if (opts.required) r = r.required()
      return r
    },
  })
}

export function bool(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'boolean',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    initialValue: (opts.initialValue as boolean | undefined) ?? false,
  })
}

export function strings(name: string, opts: FieldOpts & { list?: Array<{ title: string; value: string }> } = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'array',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    of: [defineArrayMember({ type: 'string' })],
    options: opts.list ? { list: opts.list, layout: 'grid' } : undefined,
  })
}

export function list(name: string, values: Array<{ title: string; value: string }>, opts: FieldOpts & { layout?: 'radio' | 'dropdown' } = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'string',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    initialValue: opts.initialValue as string | undefined,
    options: { list: values, layout: opts.layout ?? 'dropdown' },
    validation: opts.required ? (Rule) => Rule.required() : undefined,
  })
}

export function image(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'imageWithAlt',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    validation: opts.required ? (Rule) => Rule.required() : undefined,
  })
}

export function link(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'link',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
  })
}

export function cta(name: string, opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'cta',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
  })
}

export function refs(name: string, to: string[], opts: FieldOpts & { min?: number } = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'array',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    of: [defineArrayMember({ type: 'reference', to: to.map((type) => ({ type })) })],
    validation: (Rule) => Rule.unique(),
  })
}

export function ref(name: string, to: string[], opts: FieldOpts = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'reference',
    to: to.map((type) => ({ type })),
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    validation: opts.required ? (Rule) => Rule.required() : undefined,
  })
}

/** A nested group of fields (stored as a plain object, no `_type`). */
export function obj(name: string, fields: FieldDefinition[], opts: FieldOpts & { collapsed?: boolean } = {}) {
  return defineField({
    name,
    title: opts.title,
    type: 'object',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    options: { collapsible: true, collapsed: opts.collapsed ?? false },
    fields,
  })
}

/**
 * An array of inline objects. The member type is named `${name}Item`
 * (the rule the seed follows).
 */
export function items(
  name: string,
  fields: FieldDefinition[],
  opts: FieldOpts & { itemTitle?: string; preview?: PreviewConfig; icon?: ComponentType } = {},
) {
  return defineField({
    name,
    title: opts.title,
    type: 'array',
    description: opts.description,
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    of: [
      defineArrayMember({
        type: 'object',
        name: `${name}Item`,
        title: opts.itemTitle ?? 'Item',
        icon: opts.icon,
        fields,
        preview: opts.preview,
      }),
    ],
  })
}

export function slug(name = 'slug', opts: FieldOpts & { source?: string } = {}) {
  return defineField({
    name,
    title: opts.title ?? 'URL slug',
    type: 'slug',
    description: opts.description ?? 'The last part of the page address. Lowercase words joined by hyphens.',
    group: opts.group,
    fieldset: opts.fieldset,
    hidden: opts.hidden,
    options: { source: opts.source ?? 'title', maxLength: 96 },
    validation: opts.required === false ? undefined : (Rule) => Rule.required(),
  })
}

export function seo(group?: string) {
  return defineField({
    name: 'seo',
    title: 'Search and sharing',
    type: 'seo',
    group,
    description: 'The title and description shown in Google and when the page is shared. Leave blank to use the page headline.',
  })
}

/* ---------------- sections ---------------- */

export const layoutFieldset = {
  name: 'layout',
  title: 'Layout and visibility',
  options: { collapsible: true, collapsed: true },
}

/** Fields every page-builder section carries (see SectionBase in lib/sanity/types.ts). */
export function sectionBaseFields(defaultBackground = 'white') {
  return [
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      fieldset: 'layout',
      initialValue: defaultBackground,
      options: { list: BACKGROUNDS, layout: 'dropdown' },
    }),
    defineField({
      name: 'watermark',
      title: 'R watermark',
      type: 'string',
      fieldset: 'layout',
      description: 'The large script R in a corner. Its tone matches the background.',
      initialValue: 'none',
      options: { list: WATERMARKS, layout: 'dropdown' },
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      fieldset: 'layout',
      description: 'Optional. Lets a button jump to this section, for example "apply" for a link to #apply. Lowercase letters and hyphens only.',
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9-]+$/, { name: 'lowercase letters, numbers and hyphens' }),
    }),
    defineField({
      name: 'hidden',
      title: 'Hide this section',
      type: 'boolean',
      fieldset: 'layout',
      description: 'Hidden sections stay in the Studio but do not show on the site.',
      initialValue: false,
    }),
  ]
}

const stripMarkers = (s?: string) => (s ?? '').replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1')

/**
 * Defines a page-builder section. `titleField` is the field shown as the
 * section's name in the list of sections.
 */
export function defineSection(def: {
  name: string
  title: string
  icon?: ComponentType
  description?: string
  fields: FieldDefinition[]
  defaultBackground?: string
  titleField?: string
  fallbackTitle?: string
  fieldsets?: Array<{ name: string; title: string; options?: { collapsible?: boolean; collapsed?: boolean } }>
}) {
  const titleField = def.titleField ?? 'headline'
  return defineType({
    name: def.name,
    title: def.title,
    type: 'object',
    icon: def.icon,
    description: def.description,
    fieldsets: [layoutFieldset, ...(def.fieldsets ?? [])],
    fields: [...def.fields, ...sectionBaseFields(def.defaultBackground)],
    preview: {
      select: { heading: titleField, hidden: 'hidden', background: 'background' },
      prepare({ heading, hidden, background }: { heading?: unknown; hidden?: boolean; background?: string }) {
        const text = typeof heading === 'string' ? stripMarkers(heading) : ''
        return {
          title: text || def.fallbackTitle || def.title,
          subtitle: [def.title, background, hidden ? 'hidden' : ''].filter(Boolean).join(' · '),
          media: def.icon,
        }
      },
    },
  })
}

export { stripMarkers }
