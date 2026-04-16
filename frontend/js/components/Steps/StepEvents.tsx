import React, { useRef, useState } from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import Slider from 'react-slick'
import StepEventsList from './StepEventsList'
import { Container } from './StepEvents.style'
import type { StepEvents_step$key } from '~relay/StepEvents_step.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'
import {
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Heading,
  Icon,
  Menu,
  Tag,
  Text,
} from '@cap-collectif/ui'
import config from '~/config'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import useIsMobile from '~/utils/hooks/useIsMobile'

type Props = {
  readonly step: StepEvents_step$key
}

const FRAGMENT = graphql`
  fragment StepEvents_step on Step {
    id
    ...StepEventsList_step @arguments(count: 40, orderBy: { field: START_AT, direction: DESC })
    eventsWithoutFilters: events(orderBy: { field: START_AT, direction: DESC }, isFuture: null) {
      totalCount
    }
    eventsFuture: events(orderBy: { field: START_AT, direction: DESC }, isFuture: true) {
      totalCount
    }
    eventsPast: events(isFuture: false) {
      totalCount
    }
  }
`

export const StepEvents = ({ step: stepKey }: Props) => {
  const intl = useIntl()
  const isNewProjectPage = useFeatureFlag('new_project_page')
  const isMobile = useIsMobile()
  const step = useFragment(FRAGMENT, stepKey)
  const statusFilter = step.eventsFuture.totalCount > 0 ? 'theme.show.status.future' : 'finished'
  const [filter, setFilter] = useState(statusFilter)
  const sliderRef = useRef<Slider>(null)
  const totalCount =
    filter === 'theme.show.status.future'
      ? step.eventsFuture.totalCount
      : filter === 'finished'
      ? step.eventsPast.totalCount
      : step.eventsWithoutFilters.totalCount

  const showArrows = isNewProjectPage && totalCount > 1 && !config.isMobile

  const filterMenu = (
    <Menu
      disclosure={
        <Button variant="tertiary" rightIcon={CapUIIcon.ArrowDown}>
          {intl.formatMessage({ id: filter })}
        </Button>
      }
    >
      <Menu.List>
        <Menu.Item
          border="none"
          onClick={() => {
            setFilter('theme.show.status.future')
          }}
        >
          <Text color="gray.900">{intl.formatMessage({ id: 'theme.show.status.future' })}</Text>
        </Menu.Item>
        <Menu.Item
          border="none"
          onClick={() => {
            setFilter('finished')
          }}
        >
          <Text color="gray.900">{intl.formatMessage({ id: 'finished' })}</Text>
        </Menu.Item>
      </Menu.List>
    </Menu>
  )

  if (isNewProjectPage && isMobile) {
    return (
      <Container id="StepEvents" className="block">
        <Flex direction="column" gap="xl">
          {step.eventsFuture.totalCount > 0 && (
            <Flex direction="column" gap="md">
              <Flex direction="row" alignItems="center" gap="sm">
                <Heading as="h2" fontSize={CapUIFontSize.Headline}>
                  {step.eventsFuture.totalCount} {intl.formatMessage({ id: 'theme.show.status.future' })}
                </Heading>
              </Flex>
              <React.Suspense fallback={<Loader />}>
                <StepEventsList filter="theme.show.status.future" step={step} vertical />
              </React.Suspense>
            </Flex>
          )}
          {step.eventsPast.totalCount > 0 && (
            <Flex direction="column" gap="md">
              <Flex direction="row" alignItems="center" gap="sm">
                <Heading as="h2" fontSize={CapUIFontSize.Headline}>
                  {step.eventsPast.totalCount} {intl.formatMessage({ id: 'finished' })}
                </Heading>
              </Flex>
              <React.Suspense fallback={<Loader />}>
                <StepEventsList filter="finished" step={step} vertical />
              </React.Suspense>
            </Flex>
          )}
        </Flex>
      </Container>
    )
  }

  return (
    <Container id="StepEvents" className="block">
      {isNewProjectPage ? (
        <Flex direction="row" justify="space-between" alignItems="center" mb="xs">
          <Flex direction="row" alignItems="center" gap="lg">
            <Heading as="h2" fontSize={CapUIFontSize.Headline}>
              <span>{totalCount}</span> <FormattedMessage id="global.events" />
            </Heading>
            {filterMenu}
          </Flex>
          {showArrows && (
            <Flex gap="xs" alignItems="center">
              <Tag variantColor="infoGray" as={'button'} transparent onClick={() => sliderRef.current?.slickPrev()}>
                <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Md} />
              </Tag>
              <Tag variantColor="infoGray" as={'button'} transparent onClick={() => sliderRef.current?.slickNext()}>
                <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Md} />
              </Tag>
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex direction="row" justify="space-between" alignItems={'center'}>
          <Heading as="h2" mb={4}>
            <FormattedMessage id="global.events" /> <span className="small excerpt">{totalCount}</span>
          </Heading>
          {filterMenu}
        </Flex>
      )}
      <React.Suspense fallback={<Loader />}>
        <StepEventsList filter={filter} step={step} sliderRef={isNewProjectPage ? sliderRef : undefined} />
      </React.Suspense>
    </Container>
  )
}

export default StepEvents
