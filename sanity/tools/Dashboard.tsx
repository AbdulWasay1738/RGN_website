import { AddIcon } from '@sanity/icons/Add'
import { BellIcon } from '@sanity/icons/Bell'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CogIcon } from '@sanity/icons/Cog'
import { ComposeIcon } from '@sanity/icons/Compose'
import { DocumentIcon } from '@sanity/icons/Document'
import { EyeOpenIcon } from '@sanity/icons/EyeOpen'
import { HomeIcon } from '@sanity/icons/Home'
import { LaunchIcon } from '@sanity/icons/Launch'
import { TagIcon } from '@sanity/icons/Tag'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import { UsersIcon } from '@sanity/icons/Users'
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Stack, Text } from '@sanity/ui'
import { useEffect, useState, type ComponentType } from 'react'
import { useClient, useCurrentUser } from 'sanity'
import { useRouter } from 'sanity/router'
import { easternLabel } from '../../lib/eastern'
import { saleStatus } from '../schemaTypes/documents/sale'

type Tile = { title: string; text: string; icon: ComponentType; go: () => void; primary?: boolean }
type SaleRow = { _id: string; title?: string; startsAt?: string; endsAt?: string; enabled?: boolean }

/**
 * The Studio's start screen: big buttons for the jobs the client does most,
 * in plain words, and which sales are on or coming up.
 */
export function Dashboard() {
  const user = useCurrentUser()
  const router = useRouter()
  const client = useClient({ apiVersion: '2026-11-04' })
  const [sales, setSales] = useState<SaleRow[] | null>(null)

  useEffect(() => {
    client
      .fetch<SaleRow[]>(`*[_type == "sale" && !(_id in path("drafts.**")) && dateTime(endsAt) > dateTime(now())] | order(startsAt asc)[0...5]{ _id, title, startsAt, endsAt, enabled }`)
      .then(setSales)
      .catch(() => setSales([]))
  }, [client])

  const edit = (id: string, type: string) => () => router.navigateIntent('edit', { id, type })
  const create = (type: string) => () => router.navigateIntent('create', { type })
  const open = (path: string) => () => router.navigateUrl({ path })

  const tiles: Tile[] = [
    { title: 'Edit the website', text: 'See the real site and click any text, image or price to change it.', icon: EyeOpenIcon, go: open('/studio/presentation'), primary: true },
    { title: 'Change prices', text: 'Every course, workshop and bundle price, and the dates prices switch, on one screen.', icon: TrendUpwardIcon, go: open('/studio/prices'), primary: true },
    { title: 'Run a sale', text: 'Black Friday or any offer: pick dates and sale prices. It starts and stops by itself.', icon: TagIcon, go: create('sale'), primary: true },
    { title: 'Add a course', text: 'A new course appears on the home page and in the menus once you publish it.', icon: AddIcon, go: create('course') },
    { title: 'Write a blog post', text: 'Write, add a cover image, and publish.', icon: ComposeIcon, go: create('post') },
    { title: 'Change the banner', text: 'The dark strip at the top of every page and when each message shows.', icon: BellIcon, go: edit('announcementBanner', 'announcementBanner') },
    { title: 'Edit the home page', text: 'Headline, buttons and every section, in order.', icon: HomeIcon, go: edit('page-home', 'page') },
    { title: 'Workshop details', text: 'Venue, agenda, tickets text and seats sold.', icon: UsersIcon, go: edit('workshop', 'workshop') },
    { title: 'Growth call page', text: 'The 2027 growth strategy call: text, call days and times.', icon: CalendarIcon, go: edit('growthCall', 'growthCall') },
    { title: 'All pages', text: 'About, Contact, Careers and the rest, or build a new page.', icon: DocumentIcon, go: open('/studio/structure/pages') },
    { title: 'Menus, footer and contact details', text: 'The menu links, footer, newsletter text and email address.', icon: CogIcon, go: edit('siteSettings', 'siteSettings') },
  ]

  const firstName = user?.name?.split(' ')[0]

  return (
    <Card height="fill" overflow="auto" tone="transparent">
      <Container width={3} padding={[3, 4, 5]}>
        <Stack gap={5}>
          <Flex align="flex-end" gap={3} wrap="wrap">
            <Box flex={1}>
              <Stack gap={3}>
                <Heading size={4}>{firstName ? `Welcome, ${firstName}` : 'Welcome'}</Heading>
                <Text muted>What would you like to change on the website today?</Text>
              </Stack>
            </Box>
            <Button as="a" href="/" target="_blank" rel="noopener" icon={LaunchIcon} text="View the website" mode="ghost" />
          </Flex>

          <Grid gridTemplateColumns={[1, 2, 3]} gap={3}>
            {tiles.map((t) => (
              <Card
                key={t.title}
                as="button"
                type="button"
                padding={4}
                radius={3}
                shadow={1}
                tone={t.primary ? 'primary' : 'default'}
                onClick={t.go}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <Flex gap={3} align="flex-start">
                  <Text size={3}>
                    <t.icon />
                  </Text>
                  <Stack gap={2}>
                    <Text size={2} weight="semibold">
                      {t.title}
                    </Text>
                    <Text size={1} muted>
                      {t.text}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            ))}
          </Grid>

          <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
            <Card padding={4} radius={3} shadow={1}>
              <Stack gap={3}>
                <Heading size={1}>Sales on now and coming up</Heading>
                {sales === null ? (
                  <Text size={1} muted>
                    Loading…
                  </Text>
                ) : sales.length ? (
                  sales.map((s) => {
                    const status = saleStatus(s.startsAt, s.endsAt, s.enabled)
                    return (
                      <Flex key={s._id} align="center" gap={2} wrap="wrap">
                        <Badge tone={status === 'Live now' ? 'positive' : status === 'Scheduled' ? 'primary' : 'caution'}>{status}</Badge>
                        <Text size={1} weight="semibold">
                          {s.title}
                        </Text>
                        <Text size={1} muted>
                          {easternLabel(s.startsAt)} to {easternLabel(s.endsAt)}
                        </Text>
                      </Flex>
                    )
                  })
                ) : (
                  <Text size={1} muted>
                    No sales scheduled. Select “Run a sale” to set one up.
                  </Text>
                )}
              </Stack>
            </Card>
            <Card padding={4} radius={3} shadow={1}>
              <Stack gap={3}>
                <Heading size={1}>How saving works</Heading>
                <Text size={1} muted>
                  Changes save as a draft while you type. Visitors see them only after you select <strong>Publish</strong> (bottom right of each page).
                </Text>
                <Text size={1} muted>
                  Prices on the “Change prices” screen go live as soon as you select Save and publish.
                </Text>
                <Text size={1} muted>
                  Made a mistake? Open the page, select the clock icon (History) and restore an earlier version.
                </Text>
              </Stack>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Card>
  )
}
