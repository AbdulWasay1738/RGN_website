import { BarChartIcon } from '@sanity/icons/BarChart'
import { BellIcon } from '@sanity/icons/Bell'
import { BookIcon } from '@sanity/icons/Book'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { ClipboardIcon } from '@sanity/icons/Clipboard'
import { CogIcon } from '@sanity/icons/Cog'
import { CommentIcon } from '@sanity/icons/Comment'
import { ComposeIcon } from '@sanity/icons/Compose'
import { DocumentIcon } from '@sanity/icons/Document'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { PackageIcon } from '@sanity/icons/Package'
import { PlayIcon } from '@sanity/icons/Play'
import { TagIcon } from '@sanity/icons/Tag'
import { TiersIcon } from '@sanity/icons/Tiers'
import { TimelineIcon } from '@sanity/icons/Timeline'
import { TransferIcon } from '@sanity/icons/Transfer'
import { UserIcon } from '@sanity/icons/User'
import { UsersIcon } from '@sanity/icons/Users'
import { HomeIcon } from '@sanity/icons/Home'
import { ImagesIcon } from '@sanity/icons/Images'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { ComponentType } from 'react'
import type { StructureResolver } from 'sanity/structure'

/**
 * The Studio sidebar, in plain words and in order of use: the home page,
 * pages, courses, sales and offers first; site-wide settings, the library and
 * rarely changed settings below the line.
 */
export const structure: StructureResolver = (S, context) => {
  const singleton = (type: string, title: string, icon: ComponentType) =>
    S.listItem()
      .title(title)
      .id(type)
      .icon(icon)
      .child(S.document().schemaType(type).documentId(type).title(title))

  const docList = (type: string, title: string, icon: ComponentType, defaultOrdering?: Array<{ field: string; direction: 'asc' | 'desc' }>) =>
    S.listItem()
      .title(title)
      .id(type)
      .icon(icon)
      .child(
        S.documentTypeList(type)
          .title(title)
          .defaultOrdering(defaultOrdering ?? [{ field: '_updatedAt', direction: 'desc' }]),
      )

  return S.list()
    .title('Reel Good News')
    .items([
      S.listItem()
        .title('Home page')
        .id('home-page')
        .icon(HomeIcon)
        .child(S.document().schemaType('page').documentId('page-home').title('Home page')),
      S.listItem()
        .title('Pages')
        .id('pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages').defaultOrdering([{ field: 'title', direction: 'asc' }])),
      orderableDocumentListDeskItem({ type: 'course', title: 'Courses (drag to reorder)', icon: PlayIcon, id: 'orderable-course', S, context }),
      docList('sale', 'Sales', TagIcon, [{ field: 'startsAt', direction: 'desc' }]),
      singleton('workshop', 'Live workshop', UsersIcon),
      singleton('bundle', 'Content Machine bundle', PackageIcon),
      singleton('book', 'Book', BookIcon),
      S.listItem()
        .title('Blog')
        .id('blog')
        .icon(ComposeIcon)
        .child(
          S.list()
            .title('Blog')
            .items([
              docList('post', 'Blog posts', ComposeIcon, [{ field: 'number', direction: 'desc' }]),
              singleton('blogSettings', 'Blog page settings', ComposeIcon),
            ]),
        ),
      singleton('growthCall', 'Growth call page', CalendarIcon),
      singleton('assessment', 'Assessment', ClipboardIcon),
      S.divider(),
      singleton('announcementBanner', 'Banner', BellIcon),
      singleton('siteSettings', 'Menus, footer and site settings', CogIcon),
      singleton('salesCalendar', 'Price switch dates and seats', CalendarIcon),
      S.listItem()
        .title('Library: testimonials, FAQs, numbers, team')
        .id('library')
        .icon(ImagesIcon)
        .child(
          S.list()
            .title('Library')
            .items([
              docList('testimonial', 'Testimonials', CommentIcon),
              docList('faq', 'FAQs', HelpCircleIcon),
              docList('stat', 'Proof numbers', BarChartIcon),
              docList('teamMember', 'Team members', UserIcon, [{ field: 'order', direction: 'asc' }]),
              docList('timelineEntry', 'Timeline entries', TimelineIcon, [{ field: 'order', direction: 'asc' }]),
            ]),
        ),
      S.listItem()
        .title('More settings')
        .id('more')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('More settings')
            .items([
              singleton('courseTemplate', 'Course page labels', TiersIcon),
              singleton('orderConfirmation', 'Order confirmation page', CheckmarkCircleIcon),
              docList('legalPage', 'Legal pages', DocumentTextIcon, [{ field: 'order', direction: 'asc' }]),
              docList('redirect', 'Redirects', TransferIcon, [{ field: 'from', direction: 'asc' }]),
            ]),
        ),
    ])
}
