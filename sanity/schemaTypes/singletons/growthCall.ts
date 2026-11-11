import { CalendarIcon } from '@sanity/icons/Calendar'
import { defineField, defineType } from 'sanity'
import { accent, cta, ICONS, items, list, num, PLACEHOLDER_HELP, seo, str, strings, txt } from '../helpers'

const WEEKDAYS = [
  { title: 'Monday', value: 'Mon' },
  { title: 'Tuesday', value: 'Tue' },
  { title: 'Wednesday', value: 'Wed' },
  { title: 'Thursday', value: 'Thu' },
  { title: 'Friday', value: 'Fri' },
  { title: 'Saturday', value: 'Sat' },
  { title: 'Sunday', value: 'Sun' },
]

/**
 * The 2027 growth strategy call at /growth-strategy (client feedback round
 * two): the home page's main call to action. Step 1 captures the lead as soon
 * as the form is sent, before any time is booked. The form labels (mobile,
 * first name, last name, work email) are fixed in code.
 */
export const growthCall = defineType({
  name: 'growthCall',
  title: 'Growth call',
  type: 'document',
  icon: CalendarIcon,
  description: 'The growth strategy call booking page at /growth-strategy.',
  groups: [
    { name: 'page', title: 'Page', default: true },
    { name: 'form', title: 'Step 1: form' },
    { name: 'calendar', title: 'Step 2: calendar' },
    { name: 'booked', title: 'Booked' },
    { name: 'links', title: 'Links elsewhere' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    str('eyebrow', { title: 'Eyebrow', group: 'page' }),
    accent('headline', { title: 'Headline', required: true, group: 'page' }),
    txt('intro', { title: 'Intro', rows: 3, group: 'page' }),
    items('steps', [list('icon', ICONS, { title: 'Icon' }), str('title', { title: 'Title' }), str('text', { title: 'Text' })], {
      title: 'Steps',
      group: 'page',
      itemTitle: 'Step',
      preview: { select: { title: 'title', subtitle: 'text' } },
    }),
    str('callLengthNote', { title: 'Call length note', group: 'page', description: `The small line under the steps. ${PLACEHOLDER_HELP}` }),

    str('formStepLabel', { title: 'Step 1 label', group: 'form', description: 'For example "Fill out the form".' }),
    str('bookStepLabel', { title: 'Step 2 label', group: 'form', description: 'For example "Book your call".' }),
    txt('consentText', {
      title: 'Text message consent',
      rows: 3,
      group: 'form',
      description: 'The optional, unticked box. It must match the wording registered for business texting. [Counsel to review]',
    }),
    str('termsLine', {
      title: 'Terms line',
      group: 'form',
      description: 'The words "Terms" and "Privacy Policy" link to the legal pages by themselves.',
    }),
    str('continueLabel', { title: 'Continue button', group: 'form' }),
    str('leadSavedMessage', {
      title: 'Message after Continue',
      group: 'form',
      description: 'Shown briefly once the details are sent, for example "Details saved. Our team has them now."',
    }),
    str('editLabel', { title: 'Edit link', group: 'form', description: 'Beside the name and number once the form is sent.' }),

    str('lockedMessage', {
      title: 'Locked calendar message',
      group: 'calendar',
      description: 'Shown on the calendar until the form is filled out.',
    }),
    str('timezoneLabel', { title: 'Time zone label', group: 'calendar', description: 'For example "Eastern Time". Times are always Eastern.' }),
    str('confirmLabel', { title: 'Confirm button', group: 'calendar' }),
    strings('availableWeekdays', {
      title: 'Days with calls',
      group: 'calendar',
      list: WEEKDAYS,
      description: 'Used only when no booking calendar link is set.',
    }),
    num('bookingWindowDays', {
      title: 'Days ahead to show',
      group: 'calendar',
      integer: true,
      min: 1,
      initialValue: 30,
      description: 'How far ahead visitors can book, starting tomorrow.',
    }),
    strings('slotLabels', {
      title: 'Call times (Eastern)',
      group: 'calendar',
      description: 'Written like "10:00 AM". Used only when no booking calendar link is set.',
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking calendar link',
      type: 'url',
      group: 'calendar',
      description:
        'Paste the link to your booking calendar (a Google Calendar appointment page now, the GoHighLevel calendar later). Once the form is filled out, visitors pick a time in it, right on the page. Leave empty to show the sample calendar below instead.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    str('bookingLinkLabel', {
      title: 'Link to open the calendar in a new tab',
      group: 'calendar',
      description: 'Shown under the booking calendar, for anyone whose browser does not show it on the page.',
    }),
    num('callMinutes', { title: 'Call length (minutes)', group: 'calendar', integer: true, min: 5, initialValue: 45, description: 'Used for the calendar file.' }),
    str('ghlCalendarId', {
      title: 'GoHighLevel calendar ID',
      group: 'calendar',
      description: 'Filled in when GoHighLevel is connected. Real free times then replace the days and times above.',
    }),

    str('successTitle', { title: 'Booked title', group: 'booked' }),
    str('successBody', { title: 'Booked text', group: 'booked', description: '{date} and {time} become the chosen day and time.' }),
    str('bookedMessage', { title: 'Message after booking', group: 'booked' }),
    str('addToCalendarLabel', { title: 'Calendar file button', group: 'booked' }),
    cta('successCta', { title: 'Second button', group: 'booked' }),

    str('workshopLine', { title: 'Line under the workshop tickets', group: 'links', description: 'For example "Not sure the in-person workshop fits?"' }),
    str('workshopLinkLabel', { title: 'Link text under the workshop tickets', group: 'links' }),
    seo('seo'),
  ],
  preview: { prepare: () => ({ title: 'Growth call', subtitle: '/growth-strategy', media: CalendarIcon }) },
})
