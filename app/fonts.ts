import localFont from 'next/font/local'

/** Headings, titles, buttons, big numbers. Single weight, declared 100 to 900 so browsers never fake bold. */
export const anton = localFont({
  src: [{ path: '../assets/fonts/anton.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-anton',
  display: 'swap',
  preload: true,
  fallback: ['Arial Narrow', 'Impact', 'sans-serif'],
})

/** Body copy, labels, eyebrows, form text. */
export const nunitoSans = localFont({
  src: [
    { path: '../assets/fonts/nunito-sans-400.woff2', weight: '300 500', style: 'normal' },
    { path: '../assets/fonts/nunito-sans-600.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/nunito-sans-700.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/nunito-sans-800.woff2', weight: '800', style: 'normal' },
    { path: '../assets/fonts/nunito-sans-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-nunito',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
})

/**
 * Fallback for the handwritten accents while Benedict loads, or if it fails.
 * Benedict itself is a temporary remote face in styles/tokens.css until the
 * client's web licence is bought (docs/03, "Handwritten font setup").
 * Licorice is SIL Open Font License.
 */
export const licorice = localFont({
  src: [{ path: '../assets/fonts/licorice.woff2', weight: '400', style: 'normal' }],
  variable: '--font-licorice',
  display: 'swap',
  preload: false,
  declarations: [{ prop: 'size-adjust', value: '112%' }],
  fallback: ['cursive'],
})

export const fontVariables = `${anton.variable} ${nunitoSans.variable} ${licorice.variable}`
