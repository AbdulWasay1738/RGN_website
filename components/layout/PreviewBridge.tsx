'use client'

import { useRouter } from 'next/navigation'
import { VisualEditing } from 'next-sanity/visual-editing'
import { useSyncExternalStore } from 'react'

const noop = () => () => {}
/** True inside the Studio's Presentation tool (an iframe or a popup it opened). */
const inStudio = () => window.self !== window.top || Boolean(window.opener)

/**
 * Draft mode only: click-to-edit overlays inside the Studio's Presentation
 * tool, and a refresh whenever an editor changes a draft. Outside the Studio
 * it shows a small "Exit preview" button.
 */
export function PreviewBridge() {
  const router = useRouter()
  const insideStudio = useSyncExternalStore(noop, inStudio, () => true)

  return (
    <>
      <VisualEditing
        refresh={(payload) => {
          if (payload.source === 'manual' || payload.source === 'mutation') {
            router.refresh()
            return Promise.resolve()
          }
          return false
        }}
      />
      {!insideStudio ? (
        <button
          type="button"
          // A full page load: the route handler clears a cookie, so it must not run as a client-side navigation.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          onClick={() => window.location.assign('/api/draft-mode/disable')}
          style={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            zIndex: 500,
            background: '#091527',
            color: '#fff',
            border: 0,
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: 999,
            font: '800 12px/1 var(--fm, sans-serif)',
            letterSpacing: '.12em',
            boxShadow: '0 10px 30px rgba(5,12,23,.25)',
          }}
        >
          EXIT PREVIEW
        </button>
      ) : null}
    </>
  )
}
