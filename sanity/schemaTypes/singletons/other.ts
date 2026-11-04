import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { ClipboardIcon } from '@sanity/icons/Clipboard'
import { ComposeIcon } from '@sanity/icons/Compose'

import { defineField, defineType } from 'sanity'
import { TOPICS } from '../documents'
import { accent, bool, cta, items, link, list, num, obj, PLACEHOLDER_HELP, ref, seo, str, strings, txt } from '../helpers'

const NO_BONUS_VIDEO = 'Never mention a bonus video anywhere in the assessment text.'

/* ---------------- assessment ---------------- */

export const assessment = defineType({
  name: 'assessment',
  title: 'Assessment',
  type: 'document',
  icon: ClipboardIcon,
  description: `The free Marketing ROI Assessment: intro page, questions and thank-you page. ${NO_BONUS_VIDEO}`,
  groups: [
    { name: 'intro', title: 'Intro and form', default: true },
    { name: 'areas', title: 'Areas' },
    { name: 'questions', title: 'Questions' },
    { name: 'report', title: 'Report' },
    { name: 'thanks', title: 'Thank-you page' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    num('turnaroundDays', {
      title: 'Report turnaround (business days)',
      group: 'intro',
      integer: true,
      description: 'Once set, this number replaces "[number]" in the assessment pages.',
    }),
    obj(
      'intro',
      [str('pillTag', { title: 'Pill label' }), accent('headline', { title: 'Headline', max: 120 }), txt('subline', { title: 'Subheadline', rows: 2 }), txt('body', { title: 'Text', rows: 3 })],
      { title: 'Intro', group: 'intro', description: NO_BONUS_VIDEO },
    ),
    obj(
      'form',
      [
        str('title', { title: 'Form title' }),
        str('stepLabel', { title: 'Step label' }),
        str('firstNameLabel', { title: 'First name label' }),
        str('lastNameLabel', { title: 'Last name label' }),
        str('emailLabel', { title: 'Email label' }),
        str('phoneLabel', { title: 'Mobile label' }),
        str('companyLabel', { title: 'Company label' }),
        str('roleLabel', { title: 'Role label' }),
        str('sizeLabel', { title: 'Company size label' }),
        str('sizePlaceholder', { title: 'Company size hint' }),
        strings('companySizes', { title: 'Company sizes' }),
        txt('consentText', { title: 'Text message consent', rows: 3, description: 'Optional, unticked box. [Counsel to review.]' }),
        str('submitLabel', { title: 'Start button' }),
      ],
      { title: 'Form', group: 'intro' },
    ),
    obj('areasSection', [accent('headline', { title: 'Headline' }), str('eyebrow', { title: 'Eyebrow' })], { title: 'Areas section', group: 'areas' }),
    items('areas', [str('name', { title: 'Name', required: true }), txt('description', { title: 'Description', rows: 2 })], {
      title: 'The five areas',
      group: 'areas',
      itemTitle: 'Area',
      description: 'The order here sets the order of the questions tracker.',
      preview: { select: { title: 'name', subtitle: 'description' } },
    }),
    items(
      'questions',
      [
        str('area', { title: 'Area', description: 'Type the area name exactly as it appears in the Areas tab.' }),
        txt('question', { title: 'Question', rows: 2 }),
        defineField({
          name: 'options',
          title: 'Answers',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Two to six answers.',
          validation: (Rule) => Rule.min(2).max(6),
        }),
        list(
          'status',
          [
            { title: 'Draft', value: 'draft' },
            { title: 'Final', value: 'final' },
          ],
          { title: 'Status', initialValue: 'draft', layout: 'radio', description: 'Draft questions show a "Draft question" chip.' },
        ),
      ],
      { title: 'Questions', group: 'questions', itemTitle: 'Question', preview: { select: { title: 'question', subtitle: 'area' } } },
    ),
    obj(
      'flow',
      [
        str('areasEyebrow', { title: 'Tracker heading' }),
        str('areaLabel', { title: 'Area label', description: '{n} becomes the area number and {area} its name.' }),
        str('draftChip', { title: 'Draft chip' }),
        str('helper', { title: 'Helper text' }),
        str('errorText', { title: 'Message when no answer is picked' }),
        str('backLabel', { title: 'Back button' }),
        str('nextLabel', { title: 'Next button' }),
        str('submitLabel', { title: 'Submit button' }),
        str('sendingLabel', { title: 'Sending message' }),
        str('minutesLeft', { title: 'Time left (plural)', description: '{n} becomes the minutes.' }),
        str('minuteLeft', { title: 'Time left (one minute)' }),
      ],
      { title: 'Question pages', group: 'questions' },
    ),
    obj(
      'report',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        txt('body', { title: 'Text', rows: 2 }),
        items('steps', [str('title', { title: 'Bold start' }), str('text', { title: 'Rest of the line', description: PLACEHOLDER_HELP })], {
          title: 'Steps',
          itemTitle: 'Step',
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
      { title: 'The report section', group: 'report' },
    ),
    obj(
      'reportMock',
      [str('sampleLabel', { title: 'Sample label' }), str('title', { title: 'Report title' }), str('preparedFor', { title: 'Prepared for line' }), str('prioritiesLabel', { title: 'Priorities label' })],
      { title: 'Sample report card', group: 'report' },
    ),
    obj(
      'thankYou',
      [
        str('eyebrow', { title: 'Eyebrow' }),
        accent('headline', { title: 'Headline' }),
        txt('body', { title: 'Text', rows: 3, description: NO_BONUS_VIDEO }),
        cta('cta', { title: 'Button' }),
        items('tracker', [str('title', { title: 'Title' }), str('text', { title: 'Text' })], {
          title: 'Status tracker',
          itemTitle: 'Status',
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
        accent('meanwhileHeadline', { title: '"Meanwhile" headline' }),
        items(
          'cards',
          [
            list(
              'kind',
              [
                { title: 'Link', value: 'link' },
                { title: 'Workshop (shows the current ticket price)', value: 'workshop' },
              ],
              { title: 'Card type', initialValue: 'link' },
            ),
            list(
              'tone',
              [
                { title: 'Navy', value: 'navy' },
                { title: 'Paper', value: 'paper' },
                { title: 'Orange', value: 'orange' },
              ],
              { title: 'Colour', initialValue: 'paper' },
            ),
            str('eyebrow', { title: 'Eyebrow' }),
            str('title', { title: 'Title' }),
            str('text', { title: 'Text' }),
            link('link', { title: 'Link' }),
          ],
          { title: '"Meanwhile" cards', itemTitle: 'Card', preview: { select: { title: 'title', subtitle: 'eyebrow' } } },
        ),
      ],
      { title: 'Thank-you page', group: 'thanks' },
    ),
    seo('seo'),
  ],
  preview: { prepare: () => ({ title: 'Marketing ROI Assessment', media: ClipboardIcon }) },
})

/* ---------------- order confirmation ---------------- */

const stub = (name: string, title: string) =>
  obj(name, [str('label', { title: 'Label' }), str('date', { title: 'Big date' }), str('line1', { title: 'Line 1' }), str('line2', { title: 'Line 2' })], { title, collapsed: true })

export const orderConfirmation = defineType({
  name: 'orderConfirmation',
  title: 'Order confirmation',
  type: 'document',
  icon: CheckmarkCircleIcon,
  description: 'The page buyers see after paying.',
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    str('sampleSuffix', { title: 'Sample order note', description: 'Added to the eyebrow when the page shows a sample order.' }),
    accent('headline', { title: 'Headline' }),
    txt('workshopLead', { title: 'Text for workshop tickets', rows: 2 }),
    txt('courseLead', { title: 'Text for courses', rows: 2 }),
    stub('workshopStub', 'Ticket stub (workshop)'),
    stub('courseStub', 'Ticket stub (courses)'),
    obj(
      'rows',
      [
        str('ticket', { title: 'Ticket' }),
        str('price', { title: 'Price' }),
        str('attending', { title: 'Attending' }),
        str('access', { title: 'Access' }),
        str('name', { title: 'Name' }),
        str('order', { title: 'Order' }),
      ],
      { title: 'Row labels', collapsed: true },
    ),
    str('zoomLabel', { title: 'Attending on Zoom' }),
    str('inPersonLabel', { title: 'Attending in person', description: PLACEHOLDER_HELP }),
    str('accessValue', { title: 'Course access', description: PLACEHOLDER_HELP }),
    str('buyerPlaceholder', { title: 'Name when unknown' }),
    accent('nextHeadline', { title: '"What happens next" headline' }),
    items(
      'steps',
      [
        str('title', { title: 'Title' }),
        str('courseTitle', { title: 'Title for course orders', description: 'Optional. Used instead of the title after a course purchase.' }),
        txt('text', { title: 'Text', rows: 2 }),
        bool('showCalendarButtons', { title: 'Show the calendar buttons' }),
      ],
      { title: 'Next steps', itemTitle: 'Step', preview: { select: { title: 'title', subtitle: 'text' } } },
    ),
    obj('calendarButtons', [str('google', { title: 'Google' }), str('apple', { title: 'Apple' }), str('outlook', { title: 'Outlook' })], {
      title: 'Calendar button labels',
      collapsed: true,
    }),
    items(
      'upsells',
      [
        list(
          'kind',
          [
            { title: 'Link', value: 'link' },
            { title: 'Course (shows its current price)', value: 'course' },
          ],
          { title: 'Card type', initialValue: 'link' },
        ),
        str('eyebrow', { title: 'Eyebrow' }),
        str('title', { title: 'Title' }),
        str('text', { title: 'Text' }),
        link('link', { title: 'Link' }),
        ref('course', ['course'], { title: 'Course', hidden: ({ parent }) => parent?.kind !== 'course' }),
        str('introNote', { title: 'Note during the intro period', hidden: ({ parent }) => parent?.kind !== 'course' }),
        str('regularNote', { title: 'Note after the intro period', hidden: ({ parent }) => parent?.kind !== 'course' }),
      ],
      { title: 'Cards at the bottom', itemTitle: 'Card', preview: { select: { title: 'title', subtitle: 'eyebrow' } } },
    ),
    seo(),
  ],
  preview: { prepare: () => ({ title: 'Order confirmation', media: CheckmarkCircleIcon }) },
})

/* ---------------- blog page settings ---------------- */

export const blogSettings = defineType({
  name: 'blogSettings',
  title: 'Blog page settings',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    str('eyebrow', { title: 'Eyebrow' }),
    accent('headline', { title: 'Headline' }),
    str('allLabel', { title: '"All" tab' }),
    obj(
      'topicLabels',
      TOPICS.map((t) => str(t.value, { title: `${t.title} tab` })),
      { title: 'Topic tab labels', collapsed: true },
    ),
    str('featuredLabel', { title: 'Featured chip' }),
    str('emptyText', { title: 'Message when a topic has no posts' }),
    str('readTimeLabel', { title: 'Reading time', description: '{n} becomes the minutes, for example "{n} min read".' }),
    str('shareLabel', { title: 'Share heading' }),
    str('decisionRuleLabel', { title: 'Decision rule heading' }),
    accent('keepReadingHeadline', { title: '"Keep reading" headline' }),
    obj('assessmentCta', [txt('text', { title: 'Text', rows: 2 }), cta('cta', { title: 'Button' })], { title: 'Assessment panel under each post' }),
    seo(),
  ],
  preview: { prepare: () => ({ title: 'Blog page settings', media: ComposeIcon }) },
})

