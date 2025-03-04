import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { ProjectCard_project$key } from '~relay/ProjectCard_project.graphql';
import type { State } from '~/types';
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage';
import useIsMobile from '~/utils/hooks/useIsMobile';
import { formatInfo, formatCounter, renderTag } from './ProjectCard.utils';
import Image from '~ui/Primitives/Image';
import htmlDecode from '~/components/Utils/htmlDecode';
import { Box, BoxProps, Flex, Heading, Card, CapUIIcon } from '@cap-collectif/ui';

type Props = BoxProps & {
    project: ProjectCard_project$key
    backgroundColor: string
    isProjectsPage?: boolean
    variantSize?: 'L' | 'M'
}

const FRAGMENT = graphql`
    fragment ProjectCard_project on Project {
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
        status
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
        paperVotesTotalCount
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
        visibility
        publishedAt
        steps {
            state
            __typename
        }
        currentStep {
            __typename
            id
            timeless
            state
            timeRange {
                endAt
            }
        }
    }
`;

export const ProjectCard = ({
    project: projectKey,
    backgroundColor,
    isProjectsPage,
    gridArea,
    width,
    height,
    p,
    px,
    py,
    variantSize,
    ...props
}: Props) => {
    const intl = useIntl();
    const isMobile = useIsMobile();

    const project = useFragment(FRAGMENT, projectKey);

    const showCounters = project.hasParticipativeStep || project.isExternal;
    const numericVotesTotalCount = project.votes?.totalCount ?? 0;
    const votesTotalCount = project.isExternal
        ? project.externalVotesCount || 0
        : numericVotesTotalCount + project.paperVotesTotalCount || 0;

    return (
        <Box
            as="a"
            href={project.externalLink || project.url}
            display="grid"
            gridArea={gridArea}
            width={width || '100%'}
            height={height || '100%'}
            p={p}
            px={px}
            py={py}
            css={{
                '&:hover': {
                    textDecoration: 'none',
                },
            }}>
            <Card
                bg="white"
                p={0}
                flexDirection={variantSize === 'L' ? 'row' : 'column'}
                overflow="hidden"
                display="flex"
                border="unset"
                boxShadow="small"
                position="relative"
                {...props}>
                {project.cover?.url ? (
                    <Image
                        useDs
                        overflow="hidden"
                        src={project.cover?.url}
                        css={{
                            objectFit: 'cover',
                            objectPosition: 'left top',
                            aspectRatio: '3 / 2',
                            filter: project.archived ? 'grayscale(1)' : null,
                            opacity: project.archived ? '50%' : null,
                        }}
                        position="relative"
                        width={variantSize === 'L' ? '50%' : '100%'}
                        sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
                        alt=""
                    />
                ) : (
                    <Box
                        overflow="hidden"
                        css={{
                            background: backgroundColor,
                            backgroundSize: 'cover',
                            filter: project.archived ? 'grayscale(1)' : null,
                            opacity: project.archived ? '50%' : null,
                        }}
                        position="relative"
                        width={variantSize === 'L' ? '50%' : '100%'}
                        pt={
                            variantSize === 'L'
                                ? '300px'
                                : variantSize === 'M'
                                ? '33.33%'
                                : '66.66%'
                        } // 3:2 aspect ratio trick
                    >
                        {!project.cover?.url && <DefaultProjectImage isNewCard />}
                    </Box>
                )}
                {variantSize === 'L' ? renderTag(project, intl, variantSize === 'L') : null}
                <Flex direction="column" my={6} mx={4} bg="white" flex={1} position="relative">
                    {variantSize !== 'L' ? renderTag(project, intl) : null}
                    <Heading
                        truncate={100}
                        as="h4"
                        fontWeight="semibold"
                        mb={4}
                        color={project.archived ? 'gray.500' : 'gray.900'}
                        lineHeight="base">
                        {htmlDecode(project.title)}
                    </Heading>
                    <Flex direction="column" justifyContent="space-between" height="100%">
                        {(isProjectsPage || !isMobile) && (
                            <Flex direction="row" flexWrap="wrap" color="neutral-gray.700">
                                {project.type &&
                                    formatInfo(
                                        CapUIIcon.BookStarO,
                                        intl.formatMessage({
                                            id: project.type.title,
                                        }),
                                        project.archived,
                                        project.type?.color,
                                    )}{' '}
                                {project.districts &&
                                    project.districts?.totalCount > 0 &&
                                    formatInfo(
                                        CapUIIcon.PinO,
                                        project.districts.edges
                                            ?.map(district => district?.node?.name)
                                            .join(' • ') || null,
                                        project.archived,
                                    )}
                                {project.themes &&
                                    project.themes?.length > 0 &&
                                    formatInfo(
                                        CapUIIcon.FolderO,
                                        project.themes?.map(({ title }) => title).join(', ') || '',
                                        project.archived,
                                        null,
                                    )}
                            </Flex>
                        )}
                        {showCounters && (
                            <Flex direction="row" spacing={8} mt={4}>
                                {((project.isVotesCounterDisplayable || project.isExternal) &&
                                    votesTotalCount &&
                                    formatCounter(
                                        CapUIIcon.ThumbUpO,
                                        votesTotalCount,
                                        project.archived,
                                        intl.formatMessage({ id: 'project.votes.widget.votes' }),
                                    )) ||
                                    null}
                                {((project.isContributionsCounterDisplayable ||
                                    (project.isExternal && project.externalContributionsCount)) &&
                                    formatCounter(
                                        CapUIIcon.BubbleO,
                                        project.isExternal
                                            ? project.externalContributionsCount || 0
                                            : project.contributions.totalCount,
                                        project.archived,
                                        intl.formatMessage({ id: 'global.contribution' }),
                                    )) ||
                                    null}
                                {((project.isParticipantsCounterDisplayable ||
                                    (project.isExternal && project.externalParticipantsCount)) &&
                                    formatCounter(
                                        CapUIIcon.UserO,
                                        project.isExternal
                                            ? project.externalParticipantsCount || 0
                                            : project.contributors.totalCount +
                                                  project.anonymousVotes.totalCount +
                                                  project.anonymousReplies?.totalCount,
                                        project.archived,
                                        intl.formatMessage({
                                            id: 'capco.section.metrics.participants',
                                        }),
                                    )) ||
                                    null}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Card>
        </Box>
    );
};

const mapStateToProps = (state: State) => ({
    backgroundColor: state.default.parameters['color.btn.primary.bg'],
});

ProjectCard.displayName = 'ProjectCard';

export default connect(mapStateToProps)(ProjectCard);
