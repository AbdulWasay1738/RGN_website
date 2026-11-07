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
import { ImagesIcon } from '@sanity/icons/Images'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { ComponentType } from 'react'
import type { StructureResolver } from 'sanity/structure'

/**
 * The Studio sidebar (docs/04): site settings first, then pages, offers,
 * the assessment, the blog, the library of reusable items, legal and redirects.
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
        .title('Site')
        .id('site')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('Site')
            .items([
              singleton('siteSettings', 'Site settings', CogIcon),
              singleton('announcementBanner', 'Announcement banner', BellIcon),
              singleton('salesCalendar', 'Sales calendar and seats', CalendarIcon),
            ]),
        ),
      S.listItem()
        .title('Pages')
        .id('pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages').defaultOrdering([{ field: 'title', direction: 'asc' }])),
      singleton('growthCall', 'Growth call', CalendarIcon),
      S.listItem()
        .title('Offers')
        .id('offers')
        .icon(TagIcon)
        .child(
          S.list()
            .title('Offers')
            .items([
              singleton('workshop', 'Workshop', UsersIcon),
              orderableDocumentListDeskItem({ type: 'course', title: 'Courses', icon: PlayIcon, id: 'orderable-course', S, context }),
              singleton('courseTemplate', 'Course page labels', TiersIcon),
              singleton('bundle', 'Content Machine bundle', PackageIcon),
              singleton('book', 'Book', BookIcon),
            ]),
        ),
      singleton('assessment', 'Assessment', ClipboardIcon),
      singleton('orderConfirmation', 'Order confirmation', CheckmarkCircleIcon),
      S.listItem()
        .title('Blog')
        .id('blog')
        .icon(ComposeIcon)
        .child(
          S.list()
            .title('Blog')
            .items([
              singleton('blogSettings', 'Blog page settings', ComposeIcon),
              docList('post', 'Blog posts', ComposeIcon, [{ field: 'number', direction: 'desc' }]),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Library')
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
      docList('legalPage', 'Legal pages', DocumentTextIcon, [{ field: 'order', direction: 'asc' }]),
      docList('redirect', 'Redirects', TransferIcon, [{ field: 'from', direction: 'asc' }]),
    ])
}
