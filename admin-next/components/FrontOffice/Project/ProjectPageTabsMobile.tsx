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
  CardCoverPlaceholder,
  Flex,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

const FRAGMENT = graphql`
  fragment ProjectPageTabsMobile_project on Project {
    steps {
      id
      title
      __typename
      enabled
      body
      events(first: 100) {
        edges {
          node {
            id
            title
            url
          }
        }
      }
    }
    posts(first: 100) {
      edges {
        node {
          id
          title
          url
        }
      }
    }
  }
`

type CompactItem = { id: string; title: string; url: string }

const ItemCardCompact: React.FC<{ item: CompactItem }> = ({ item }) => (
  <Card format="horizontal">
    <CardCover>
      <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
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
            disclosure={
              <Button variant="tertiary" rightIcon={CapUIIcon.LongArrowRight}>
                {intl.formatMessage({ id: 'global.more' })}
              </Button>
            }
          >
            {({ hide }) => (
              <>
                <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
                  <Heading>{title}</Heading>
                </Modal.Header>
                <Modal.Body>{modalContent}</Modal.Body>
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

type Props = {
  project: ProjectPageTabsMobile_project$key
}

const ProjectPageTabsMobile: React.FC<Props> = ({ project: projectRef }) => {
  const intl = useIntl()
  const project = useFragment(FRAGMENT, projectRef)

  const enabledSteps = project.steps.filter(s => s.enabled)
  const posts = project.posts.edges?.flatMap(edge => (edge?.node ? [edge.node] : [])) ?? []
  const allEvents = project.steps.flatMap(
    step => step.events.edges?.flatMap(edge => (edge?.node ? [edge.node] : [])) ?? [],
  )

  return (
    <Flex direction="column" gap="md" px="md" py="lg">
      {enabledSteps.map(step => {
        const bodyPreview = (
          <Box overflow="hidden" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 6 }}>
            <WYSIWYGRender value={step.body ?? ''} />
          </Box>
        )
        return (
          <TabSection
            key={step.id}
            title={step.title}
            hasViewMore={!!step.body}
            previewContent={bodyPreview}
            modalContent={<WYSIWYGRender value={step.body ?? ''} />}
          />
        )
      })}

      {allEvents.length > 0 && (
        <TabSection
          title={intl.formatMessage({ id: 'global.events' })}
          hasViewMore={allEvents.length >= 2}
          previewContent={allEvents[0] ? <ItemCardCompact item={allEvents[0]} /> : null}
          modalContent={
            <Flex direction="column" gap="md">
              {allEvents.map(event => (
                <ItemCardCompact key={event.id} item={event} />
              ))}
            </Flex>
          }
        />
      )}

      {posts.length > 0 && (
        <TabSection
          title={intl.formatMessage({ id: 'menu.news' })}
          hasViewMore={posts.length >= 2}
          previewContent={posts[0] ? <ItemCardCompact item={posts[0]} /> : null}
          modalContent={
            <Flex direction="column" gap="md">
              {posts.map(post => (
                <ItemCardCompact key={post.id} item={post} />
              ))}
            </Flex>
          }
        />
      )}
    </Flex>
  )
}

export default ProjectPageTabsMobile
