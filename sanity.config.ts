'use client'

/**
 * Sanity Studio configuration, mounted at /studio (app/studio/[[...tool]]/page.tsx).
 * Marked as a client module so the Next.js page can pass it to <NextStudio>.
 */
import { HomeIcon } from '@sanity/icons/Home'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './lib/sanity/env'
import { StudioIcon } from './sanity/components/StudioIcon'
import { locations, mainDocuments } from './sanity/presentation'
import { schemaTypes, SINGLETON_TYPES } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { Dashboard } from './sanity/tools/Dashboard'
import { PricesTool } from './sanity/tools/PricesTool'

/** Actions a singleton keeps: no delete, duplicate or unpublish, so the site never loses it. */
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Reel Good News',
  icon: StudioIcon,
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure, title: 'All content' }),
    presentationTool({
      title: 'Edit the website',
      // The preview loads the site on the Studio's own origin.
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
      resolve: { locations, mainDocuments },
    }),
    // The query tool is for developers only.
    ...(process.env.NODE_ENV === 'development' ? [visionTool({ defaultApiVersion: apiVersion, title: 'Query tool' })] : []),
  ],
  // The Studio opens on the start screen; "Prices & sales" sits next to it.
  tools: (prev) => [
    { name: 'home', title: 'Home', icon: HomeIcon, component: Dashboard },
    { name: 'prices', title: 'Prices & sales', icon: TrendUpwardIcon, component: PricesTool },
    ...prev,
  ],
  schema: {
    types: schemaTypes,
    // Singletons cannot be created from "New document"; each opens from the sidebar.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType) ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action)) : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter((t) => !SINGLETON_TYPES.has(t.templateId)) : prev,
  },
})
