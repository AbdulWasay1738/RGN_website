import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SpinningReel } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import type { Background, TeamGridSection, TeamMember } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './TeamGrid.module.css'

const grid = { ['--min' as string]: '280px', ['--gap' as string]: '20px' } as CSSProperties

/** About "Meet the team.": member cards, a placeholder card for members without a photo, and the hiring card. */
export function TeamGrid({ section }: SectionProps<TeamGridSection>) {
  const background: Background = clean(section.background) ?? 'paper'
  const members = (section.members ?? []).filter((m) => m?.name)
  const hiring = section.showHiringCard ? section.hiringCard : null

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap">
        <div className="sec-head">
          <AccentText as="h2" text={section.headline} className="h2 rv" />
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        </div>
        <div className="grid" style={grid}>
          {members.map((m) => (m.cutout?.asset || m.photo?.asset ? <MemberCard key={m._id} member={m} /> : <PlaceholderCard key={m._id} member={m} />))}
          {hiring?.headline ? (
            hiring.link?.href ? (
              <Link href={hiring.link.href} className={`card lift rv ${styles.hiring}`}>
                <HiringInner hiring={hiring} />
              </Link>
            ) : (
              <div className={`card rv ${styles.hiring}`}>
                <HiringInner hiring={hiring} />
              </div>
            )
          ) : null}
        </div>
      </div>
    </Band>
  )
}

function HiringInner({ hiring }: { hiring: NonNullable<TeamGridSection['hiringCard']> }) {
  return (
    <>
      {hiring.eyebrow ? <span className="eyebrow">{hiring.eyebrow}</span> : null}
      <span className={`display ${styles.hiringTitle}`}>{hiring.headline}</span>
      {hiring.linkLabel ? (
        <span className={`tlink ${styles.hiringLink}`}>
          {hiring.linkLabel} <Icon name="arrow" />
        </span>
      ) : null}
    </>
  )
}

function MemberCard({ member }: { member: TeamMember }) {
  const hasCutout = !!member.cutout?.asset
  return (
    <article className="card lift rv">
      <div className={styles.media}>
        {hasCutout ? (
          <>
            <SpinningReel disc="#C6A7ED" hole="#F1EAFB" seconds={90} className={styles.reel} />
            <SanityImage image={member.cutout} className={styles.cutout} sizes="160px" />
          </>
        ) : (
          <SanityImage image={member.photo} className={styles.photo} sizes="(max-width: 760px) 100vw, 400px" />
        )}
      </div>
      <div className={`row between ${styles.meta}`}>
        <span className={styles.who}>
          <strong className={`display ${styles.name}`}>{member.name}</strong>
          {member.title ? (
            <>
              <br />
              <span className="muted">{member.title}</span>
            </>
          ) : null}
        </span>
        {member.linkLabel ? (
          <ButtonLink href={member.link?.href} style="dark" small>
            {member.linkLabel}
          </ButtonLink>
        ) : null}
      </div>
    </article>
  )
}

function PlaceholderCard({ member }: { member: TeamMember }) {
  return (
    <article className={`rv stack g8 ${styles.placeholder}`}>
      <span className={styles.plus} aria-hidden="true">
        <Icon name="plus" />
      </span>
      <strong className={styles.placeholderName}>{member.name}</strong>
      {member.title ? <span className={styles.placeholderText}>{member.title}</span> : null}
      {member.bio ? <span className={styles.placeholderText}>{member.bio}</span> : null}
    </article>
  )
}
