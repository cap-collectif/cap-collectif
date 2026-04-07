import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Box,
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  CardCoverPlaceholder,
  Flex,
  Heading,
  Icon,
  Modal,
  Tag,
  Text,
} from '@cap-collectif/ui'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type StepState = 'OPENED' | 'CLOSED' | 'FUTURE'

type Props = {
  title: string
  body?: string | null
  state: StepState
  timeless: boolean
  timeRange: {
    startAt?: string | null
    endAt?: string | null
  }
  projectUrl?: string | null
  coverUrl?: string | null
  votesCount?: number | null
  contributionsCount?: number | null
  participantsCount?: number | null
  eventsCount?: number
}

const StepPageHeaderNew: React.FC<Props> = ({
  title,
  body,
  state,
  timeless,
  timeRange,
  projectUrl,
  coverUrl,
  votesCount,
  contributionsCount,
  participantsCount,
  eventsCount = 0,
}) => {
  const intl = useIntl()
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    if (bodyRef.current) {
      setIsTruncated(bodyRef.current.scrollHeight > bodyRef.current.clientHeight)
    }
  }, [body])

  const remainingDays = timeRange.endAt
    ? Math.ceil((new Date(timeRange.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const showRemainingTag = !timeless && state === 'OPENED' && remainingDays !== null && remainingDays >= 0
  const showClosedTag = state === 'CLOSED'
  const showFutureTag = state === 'FUTURE'

  return (
    <Box position="relative">
      {/* Background */}
      <Box position="absolute" zIndex={0} bg="#FAFCFF" top="0" left="0" right="0" height="270px"></Box>

      <Flex className="container" direction="column" gap={4} position="relative" zIndex={1}>
        {/* Back to project button */}
        {projectUrl && (
          <Box>
            <Button as="a" href={projectUrl} variant="tertiary" variantSize="big" leftIcon={CapUIIcon.LongArrowLeft}>
              {intl.formatMessage({ id: 'front.back-to-project' })}
            </Button>
          </Box>
        )}

        {/* Card */}
        <Flex bg="white" borderRadius="normal" p={4} gap={6} align="flex-start">
          {/* Cover image */}
          <Box
            position="relative"
            flexShrink={0}
            width="288px"
            height="192px"
            borderRadius="sm"
            border="normal"
            borderColor="gray.200"
            overflow="hidden"
            backgroundColor="neutral-gray.100"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            ) : (
              <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
            )}
            {showRemainingTag && (
              <Box position="absolute" top={2} left={2} zIndex={1}>
                <Tag variantColor="info">
                  <Icon name={CapUIIcon.HourglassO} size={CapUIIconSize.Sm} />
                  <Text>{intl.formatMessage({ id: 'count.daysLeft' }, { count: remainingDays })}</Text>
                </Tag>
              </Box>
            )}
            {showClosedTag && (
              <Box position="absolute" top={2} left={2} zIndex={1}>
                <Tag variantColor="infoGray">
                  <Icon name={CapUIIcon.ClockO} size={CapUIIconSize.Sm} />
                  <Text>{intl.formatMessage({ id: 'step.status.closed' })}</Text>
                </Tag>
              </Box>
            )}
            {showFutureTag && (
              <Box position="absolute" top={2} left={2} zIndex={1}>
                <Tag variantColor="warning">
                  <Icon name={CapUIIcon.CalendarO} size={CapUIIconSize.Sm} />
                  <Text>{intl.formatMessage({ id: 'step.status.future' })}</Text>
                </Tag>
              </Box>
            )}
          </Box>

          {/* Content */}
          <Flex flex={1} direction="column" gap={4} p={4} alignSelf="stretch" justify="center" minWidth={0}>
            <Flex direction="column" gap={1}>
              <Heading as="h2" fontWeight="semibold" fontSize={CapUIFontSize.Headline} color="text.primary">
                {title}
              </Heading>
              {body && (
                <Box position="relative">
                  <Box
                    ref={bodyRef}
                    fontSize={CapUIFontSize.BodyLarge}
                    color="text.secondary"
                    style={
                      {
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      } as React.CSSProperties
                    }
                  >
                    <WYSIWYGRender value={body} />
                  </Box>
                  {isTruncated && (
                    <Modal
                      ariaLabel={intl.formatMessage({ id: 'global.read_more' })}
                      size={CapUIModalSize.Xl}
                      disclosure={
                        <Box
                          position="absolute"
                          bottom={0}
                          right={0}
                          pl="50px"
                          style={{
                            background: 'linear-gradient(to right, transparent, white 30%)',
                          }}
                        >
                          <Text
                            as="span"
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            color="text.secondary"
                            fontSize={CapUIFontSize.BodyLarge}
                          >
                            {intl.formatMessage({ id: 'global.read_more' })}
                          </Text>
                        </Box>
                      }
                    >
                      <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
                        <Heading as="h4">{title}</Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <WYSIWYGRender value={body} />
                      </Modal.Body>
                    </Modal>
                  )}
                </Box>
              )}
            </Flex>

            {/* Counters */}
            <Flex direction="row" wrap="wrap" gap={4} align="center">
              {votesCount !== null && votesCount !== undefined && (
                <Flex align="center" gap={1} p={1} borderRadius="sm" bg="white">
                  <Icon name={CapUIIcon.ThumbUp} size={CapUIIconSize.Sm} color="text.secondary" />
                  <Text fontSize={CapUIFontSize.BodySmall} color="text.secondary">
                    {intl.formatNumber(votesCount)} {intl.formatMessage({ id: 'global.vote' })}
                  </Text>
                </Flex>
              )}
              {contributionsCount !== null && contributionsCount !== undefined && (
                <Flex align="center" gap={1} p={1} borderRadius="sm" bg="white">
                  <Icon name={CapUIIcon.BubbleO} size={CapUIIconSize.Sm} color="text.secondary" />
                  <Text fontSize={CapUIFontSize.BodySmall} color="text.secondary">
                    {intl.formatNumber(contributionsCount)} {intl.formatMessage({ id: 'global.contribution' })}
                  </Text>
                </Flex>
              )}
              {participantsCount !== null && participantsCount !== undefined && (
                <Flex align="center" gap={1} p={1} borderRadius="sm" bg="white">
                  <Icon name={CapUIIcon.UserO} size={CapUIIconSize.Sm} color="text.secondary" />
                  <Text fontSize={CapUIFontSize.BodySmall} color="text.secondary">
                    {intl.formatNumber(participantsCount)}{' '}
                    {intl.formatMessage({ id: 'project.show.meta.info.contributors' })}
                  </Text>
                </Flex>
              )}
              {eventsCount > 0 && (
                <a href="#StepEvents" style={{ textDecoration: 'none' }}>
                  <Flex align="center" gap={1} p={1} borderRadius="sm" bg="white">
                    <Icon name={CapUIIcon.CalendarO} size={CapUIIconSize.Sm} color="text.secondary" />
                    <Text fontSize={CapUIFontSize.BodySmall} color="text.secondary" textDecoration="underline">
                      {intl.formatNumber(eventsCount)} {intl.formatMessage({ id: 'global.events' })}
                    </Text>
                  </Flex>
                </a>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export default StepPageHeaderNew
