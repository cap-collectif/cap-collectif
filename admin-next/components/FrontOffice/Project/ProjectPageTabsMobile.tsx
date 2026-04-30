'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageTabsMobile_project$key } from '@relay/ProjectPageTabsMobile_project.graphql'
import {
  Box,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIModalSize,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  Flex,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { isTabVisible } from './ProjectTabs.utils'

const FRAGMENT = graphql`
  fragment ProjectPageTabsMobile_project on Project {
    tabs {
      id
      slug
      title
      enabled
      type
      __typename
      ... on ProjectTabPresentation {
        body
      }
      ... on ProjectTabCustom {
        body
      }
      ... on ProjectTabNews {
        news {
          id
          title
          url
          media {
            url
          }
        }
      }
      ... on ProjectTabEvents {
        events {
          id
          title
          url
          media {
            url
          }
        }
      }
    }
  }
`

type CompactItem = { id: string; title: string; url: string; media?: { url: string } | null }

const ItemCardCompact: React.FC<{ item: CompactItem }> = ({ item }) => (
  <Card format="horizontal">
    <CardCover>
      {item.media?.url ? (
        <CardCoverImage src={item.media.url} />
      ) : (
        <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
      )}
    </CardCover>
    <CardContent primaryInfo={item.title} href={item.url} />
  </Card>
)

type TabSectionProps = {
  title: string
  hasViewMore: boolean
  previewContent: React.ReactNode
  modalContent: React.ReactNode
}

const TabSection: React.FC<TabSectionProps> = ({ title, hasViewMore, previewContent, modalContent }) => {
  const intl = useIntl()

  return (
    <Box bg="white" borderRadius="8px" p="lg">
      <Flex justifyContent="space-between" alignItems="center" mb="md">
        <Text fontSize={CapUIFontSize.Headline} fontWeight={CapUIFontWeight.Normal} color="gray.700">
          {title}
        </Text>
        {hasViewMore && (
          <Modal
            size={CapUIModalSize.Md}
            fullSizeOnMobile
            ariaLabel={title}
            alwaysOpenInPortal
            disclosure={
              <Button variant="tertiary" rightIcon={CapUIIcon.LongArrowRight}>
                {intl.formatMessage({ id: 'global.more' })}
              </Button>
            }
          >
            {({ hide }) => (
              <>
                <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })} p="lg">
                  <Heading>{title}</Heading>
                </Modal.Header>
                <Modal.Body p="lg" mt="lg">
                  {modalContent}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" variantColor="primary" variantSize="big" onClick={hide} width="100%">
                    {intl.formatMessage({ id: 'global.back' })}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal>
        )}
      </Flex>
      {previewContent}
    </Box>
  )
}

const WYSIWYGTabSection: React.FC<{ title: string; body: string | null | undefined }> = ({ title, body }) => {
  const clampRef = React.useRef<HTMLDivElement>(null)
  const [hasViewMore, setHasViewMore] = React.useState(false)

  React.useEffect(() => {
    const el = clampRef.current
    if (el) setHasViewMore(el.scrollHeight > el.clientHeight)
  }, [body])

  return (
    <TabSection
      title={title}
      hasViewMore={hasViewMore}
      previewContent={
        <Box color="text.primary">
          <div
            ref={clampRef}
            style={{ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 6 }}
          >
            <WYSIWYGRender value={body ?? ''} />
          </div>
        </Box>
      }
      modalContent={<WYSIWYGRender value={body ?? ''} />}
    />
  )
}

const EventsPostsModalContent = ({ items }) => (
  <Flex direction="column" gap="md">
    {items.map(item => (
      <ItemCardCompact key={item.id} item={item} />
    ))}
  </Flex>
)

type Props = {
  project: ProjectPageTabsMobile_project$key
}

const ProjectPageTabsMobile: React.FC<Props> = ({ project: projectRef }) => {
  const project = useFragment(FRAGMENT, projectRef)
  const intl = useIntl()

  const visibleTabs = project.tabs.filter(isTabVisible)

  if (visibleTabs.length === 0) return null

  return (
    <Flex direction="column" gap="md" px="md" py="lg" width="100%">
      {visibleTabs.map(tab => {
        if (tab.type === 'EVENTS' && (!tab.events || tab.events.length === 0)) return null
        if (tab.type === 'NEWS' && (!tab.news || tab.news.length === 0)) return null

        if (tab.type === 'PRESENTATION' || tab.type === 'CUSTOM') {
          return <WYSIWYGTabSection key={tab.id} title={tab.title} body={tab.body} />
        }

        const title =
          tab.type === 'EVENTS'
            ? intl.formatMessage({ id: 'global.events' })
            : intl.formatMessage({ id: 'global.news' })

        const hasViewMore =
          (tab.type === 'NEWS' && tab.news.length > 1) || (tab.type === 'EVENTS' && tab.events.length > 1)

        return (
          <TabSection
            key={tab.id}
            title={title}
            hasViewMore={hasViewMore}
            previewContent={<ItemCardCompact item={tab.type === 'EVENTS' ? tab.events[0] : tab.news[0]} />}
            modalContent={<EventsPostsModalContent items={tab.type === 'EVENTS' ? tab.events : tab.news} />}
          />
        )
      })}
    </Flex>
  )
}

export default ProjectPageTabsMobile
