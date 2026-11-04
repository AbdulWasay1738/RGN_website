'use client'

/**
 * Sanity Studio configuration, mounted at /studio (app/studio/[[...tool]]/page.tsx).
 * Marked as a client module so the Next.js page can pass it to <NextStudio>.
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './lib/sanity/env'
import { StudioIcon } from './sanity/components/StudioIcon'
import { locations, mainDocuments } from './sanity/presentation'
import { schemaTypes, SINGLETON_TYPES } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

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
    structureTool({ structure, title: 'Content' }),
    presentationTool({
      title: 'Live preview',
      // The preview loads the site on the Studio's own origin.
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
      resolve: { locations, mainDocuments },
    }),
    visionTool({ defaultApiVersion: apiVersion, title: 'Query tool' }),
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
