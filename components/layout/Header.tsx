'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSite } from '@/components/providers/SiteProvider'
import { CtaLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
import { isActiveHref, visibleHref } from './navLinks'
import styles from './Header.module.css'

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

/** Sticky header: logo, main nav with the Education and Media dropdowns, header CTA and the mobile menu button. */
export function Header() {
  const { settings, hiddenHrefs } = useSite()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const [lastPath, setLastPath] = useState(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    const raf = window.requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Close everything on navigation (state adjusted during render, as React recommends).
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpenKey(null)
    setMenuOpen(false)
  }

  // Outside click and Escape close the dropdowns.
  useEffect(() => {
    if (!openKey) return
    const onDocClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenKey(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [openKey])

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false)
    if (restoreFocus) window.setTimeout(() => menuBtnRef.current?.focus(), 0)
  }, [])

  const nav = settings?.headerNav ?? []

  return (
    <>
      <header ref={headerRef} className={`${styles.hdr} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`wrap ${styles.hdrIn}`}>
          <Link href="/" className={styles.logo} aria-label="Reel Good News home">
            <SanityImage
              image={settings?.logo}
              fallback={{ file: 'logo.png', alt: 'Reel Good News' }}
              alt="Reel Good News"
              priority
              sizes="180px"
            />
          </Link>
          <nav className={styles.nav} aria-label="Main">
            {nav.map((item) => {
              if (item.dropdown?.items?.length || item.dropdown?.showFeature) {
                return (
                  <NavDropdown
                    key={item._key}
                    item={item}
                    open={openKey === item._key}
                    hiddenHrefs={hiddenHrefs}
                    feature={settings?.megaMenuFeature}
                    onOpen={() => setOpenKey(item._key)}
                    onClose={() => setOpenKey((k) => (k === item._key ? null : k))}
                    onToggle={() => setOpenKey((k) => (k === item._key ? null : item._key))}
                    onHoverEnter={() => {
                      if (!canHover()) return
                      window.clearTimeout(closeTimer.current)
                      setOpenKey(item._key)
                    }}
                    onHoverLeave={() => {
                      if (!canHover()) return
                      window.clearTimeout(closeTimer.current)
                      closeTimer.current = window.setTimeout(
                        () => setOpenKey((k) => (k === item._key ? null : k)),
                        180,
                      )
                    }}
                  />
                )
              }
              const href = visibleHref(item.link?.href, hiddenHrefs)
              if (!href || !item.label) return null
              const active = isActiveHref(pathname, href)
              return (
                <Link
                  key={item._key}
                  href={href}
                  className={`${styles.navA} ${active ? styles.on : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            <CtaLink cta={settings?.headerCta} small arrow className={styles.hdrCta} track="header_ready_to_scale" />
            <button
              ref={menuBtnRef}
              type="button"
              className={styles.menuBtn}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? 'mobile-menu' : undefined}
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" />
            </button>
          </nav>
        </div>
      </header>
      {menuOpen ? <MobileMenu onClose={closeMenu} /> : null}
    </>
  )
}
