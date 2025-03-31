import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  Flex,
  Text,
  Box,
  Card,
  Heading,
  CapUIIcon,
  Icon,
  CapUIIconSize,
  CapUILineHeight,
  CapUIFontWeight,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage'
import { FontWeight, LineHeight } from '~ui/Primitives/constants'
import useIsMobile from '~/utils/hooks/useIsMobile'
import type { EventPageProjectList_event$key } from '~relay/EventPageProjectList_event.graphql'
import colors from '~/styles/modules/colors'
import FormattedNumber from '~/components/Utils/FormattedNumber'
const FRAGMENT = graphql`
  fragment EventPageProjectList_event on Event {
    projects {
      id
      title
      type {
        title
        color
      }
      themes {
        title
      }
      cover {
        url
      }
      isExternal
      externalLink
      url
      isVotesCounterDisplayable
      isContributionsCounterDisplayable
      isParticipantsCounterDisplayable
      archived
      votes {
        totalCount
      }
      anonymousVotes: votes(anonymous: true) {
        totalCount
      }
      contributions {
        totalCount
      }
      contributors {
        totalCount
      }
      anonymousReplies: contributions(type: REPLY_ANONYMOUS) {
        totalCount
      }
      hasParticipativeStep
      externalParticipantsCount
      externalContributionsCount
      externalVotesCount
      districts {
        totalCount
        edges {
          node {
            name
          }
        }
      }
    }
    steps {
      url
      project {
        id
      }
    }
  }
`
type Props = {
  readonly eventRef: EventPageProjectList_event$key
}

const EventPageProjectList = ({ eventRef }: Props) => {
  const { projects, steps } = useFragment(FRAGMENT, eventRef)
  const intl = useIntl()
  const isMobile = useIsMobile()

  if (projects.length === 0) {
    return null
  }

  const getUrl = project => {
    const hasStep = steps.filter(step => step.project?.id === project.id)

    if (hasStep[0]) {
      return hasStep[0].url
    }

    return project.externalLink || project.url
  }

  return (
    <Box mt={8}>
      <Heading
        fontSize={CapUIFontSize.Headline}
        lineHeight={CapUILineHeight.M}
        fontWeight={CapUIFontWeight.Normal}
        color="neutral-gray.900"
        mb={6}
      >
        {intl.formatMessage(
          {
            id: 'event.page.project.list',
          },
          {
            num: projects.length,
          },
        )}
      </Heading>
      <Box display="flex" flexDirection="column" gap={4}>
        {projects.map(project => (
          <Box
            as="a"
            flexDirection="row"
            href={getUrl(project)}
            style={{
              textDecoration: 'none',
            }}
          >
            <Card
              bg="white"
              p={isMobile ? 0 : 2}
              height="94px"
              width="100%"
              flexDirection="row"
              alignItems="center"
              overflow="hidden"
              display="flex"
              boxShadow="small"
              position="relative"
              style={{
                borderRadius: '8px',
                boxShadow: 'none',
              }}
            >
              <Box
                overflow="hidden"
                style={{
                  background: project.cover?.url ? `url(${project.cover?.url})` : colors['neutral-gray']['700'],
                  backgroundSize: 'cover',
                  filter: project.archived ? 'grayscale(1)' : null,
                  opacity: project.archived ? '50%' : null,
                  borderRadius: '8px',
                }}
                position="relative"
                height="78px"
                width="112px"
              >
                {!project.cover?.url && <DefaultProjectImage isNewCard />}
              </Box>
              <Flex
                direction="column"
                bg="white"
                ml={4}
                flex={1}
                overflow="hidden"
                height={isMobile ? '100%' : 'auto'}
                justifyContent={isMobile ? 'space-around' : 'initial'}
              >
                <Heading
                  truncate={isMobile ? 30 : 70}
                  height="24px"
                  as="h4"
                  fontSize="3"
                  fontWeight={FontWeight.Semibold}
                  color={project.archived ? 'gray.500' : 'neutral-gray.900'}
                  lineHeight={isMobile ? 'initial' : LineHeight.Base}
                  mb={2}
                >
                  {project.title}
                </Heading>
                {!isMobile && (
                  <Flex direction="row" flexWrap="wrap" color="neutral-gray.700" mb={2} height="16px">
                    {project.districts && project.districts?.totalCount > 0 && (
                      <Flex maxWidth="100%" direction="row" alignItems="center" mr={2}>
                        <Icon name={CapUIIcon.PinO} size={CapUIIconSize.Sm} />
                        <Text
                          as="span"
                          truncate={project.themes && project.themes?.length > 0 ? 30 : 50}
                          style={{
                            whiteSpace: 'nowrap',
                            fontSize: '13px',
                            fontWeight: '400',
                            color: project.archived ? colors['neutral-gray']['400'] : colors.gray['700'],
                          }}
                        >
                          {project.districts.edges?.map(district => district?.node?.name).join(' • ') || null}
                        </Text>
                      </Flex>
                    )}
                    {project.type && (
                      <Flex maxWidth="100%" direction="row" alignItems="center" mr={2}>
                        <Icon name={CapUIIcon.BookStarO} size={CapUIIconSize.Sm} />
                        <Text
                          as="span"
                          truncate={20}
                          style={{
                            whiteSpace: 'nowrap',
                            fontSize: '13px',
                            fontWeight: '400',
                            color: project.archived ? colors.gray['700'] : project.type?.color,
                          }}
                        >
                          {intl.formatMessage({
                            id: project.type.title,
                          })}
                        </Text>
                      </Flex>
                    )}
                    {project.themes && project.themes?.length > 0 && (
                      <Flex maxWidth="100%" direction="row" alignItems="center" mr={2}>
                        <Icon name={CapUIIcon.FolderO} size={CapUIIconSize.Sm} />
                        <Text
                          as="span"
                          truncate={project.districts && project.districts?.totalCount > 0 ? 20 : 50}
                          style={{
                            whiteSpace: 'nowrap',
                            fontSize: '13px',
                            fontWeight: '400',
                            color: project.archived ? colors['neutral-gray']['400'] : colors.gray['700'],
                          }}
                        >
                          {project.themes?.map(({ title }) => title).join(', ') || ''}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                )}
                {(project.hasParticipativeStep || project.isExternal) && (
                  <Flex direction="row" spacing={8} height="24px">
                    {(project.isVotesCounterDisplayable &&
                      ((project.isExternal && project.externalVotesCount) || project.votes.totalCount) && (
                        <Flex direction="row" alignItems="center">
                          <Icon
                            name={CapUIIcon.ThumbUpO}
                            size={CapUIIconSize.Md}
                            color={project.archived ? 'gray.500' : 'gray.700'}
                            mr={1}
                          />
                          <Text fontSize={14} color={project.archived ? 'gray.500' : 'gray.900'} as="div">
                            <FormattedNumber
                              number={project.isExternal ? project.externalVotesCount || 0 : project.votes.totalCount}
                            />
                          </Text>
                        </Flex>
                      )) ||
                      null}
                    {(project.isContributionsCounterDisplayable && (
                      <Flex direction="row" alignItems="center">
                        <Icon
                          name={CapUIIcon.BubbleO}
                          size={CapUIIconSize.Md}
                          color={project.archived ? 'gray.500' : 'gray.700'}
                          mr={1}
                        />
                        <Text fontSize={14} color={project.archived ? 'gray.500' : 'gray.900'} as="div">
                          <FormattedNumber
                            number={
                              project.isExternal
                                ? project.externalContributionsCount || 0
                                : project.contributions.totalCount
                            }
                          />
                        </Text>
                      </Flex>
                    )) ||
                      null}
                    {(project.isParticipantsCounterDisplayable && (
                      <Flex direction="row" alignItems="center">
                        <Icon
                          name={CapUIIcon.UserO}
                          size={CapUIIconSize.Md}
                          color={project.archived ? 'gray.500' : 'gray.700'}
                          mr={1}
                        />
                        <Text fontSize={14} color={project.archived ? 'gray.500' : 'gray.900'} as="div">
                          <FormattedNumber
                            number={
                              project.isExternal
                                ? project.externalParticipantsCount || 0
                                : project.contributors.totalCount +
                                  project.anonymousVotes.totalCount +
                                  project.anonymousReplies?.totalCount
                            }
                          />
                        </Text>
                      </Flex>
                    )) ||
                      null}
                  </Flex>
                )}
              </Flex>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default EventPageProjectList
