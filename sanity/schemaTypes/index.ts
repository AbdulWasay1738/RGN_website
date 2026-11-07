import { documentTypes } from './documents'
import { objectTypes } from './objects'
import { sectionTypes } from './sections'
import { announcementBanner, salesCalendar, siteSettings } from './singletons/site'
import { book, bundle, courseTemplate, workshop } from './singletons/offers'
import { growthCall } from './singletons/growthCall'
import { assessment, blogSettings, orderConfirmation } from './singletons/other'

/**
 * Singletons: one document each, stored under a fixed ID equal to the type
 * name (the site queries `*[_id == "siteSettings"]`, and so on).
 */
export const SINGLETON_TYPES = new Set([
  'siteSettings',
  'announcementBanner',
  'salesCalendar',
  'workshop',
  'courseTemplate',
  'bundle',
  'book',
  'assessment',
  'orderConfirmation',
  'blogSettings',
  'growthCall',
])

export const schemaTypes = [
  ...objectTypes,
  ...sectionTypes,
  ...documentTypes,
  siteSettings,
  announcementBanner,
  salesCalendar,
  workshop,
  courseTemplate,
  bundle,
  book,
  assessment,
  orderConfirmation,
  blogSettings,
  growthCall,
]
