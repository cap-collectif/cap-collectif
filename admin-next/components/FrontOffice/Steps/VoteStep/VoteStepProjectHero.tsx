'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import {
  Avatar,
  Box,
  Button,
  CapUIIcon,
  CapUIFontSize,
  CapUIIconSize,
  CapUILineHeight,
  CapUIModalSize,
  Flex,
  Heading,
  Icon,
  Modal,
  Tag,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import type {
  VoteStepProjectHero_proposalStep$data,
  VoteStepProjectHero_proposalStep$key,
} from '@relay/VoteStepProjectHero_proposalStep.graphql'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import ShareButtons from '@components/FrontOffice/SocialNetworks/ShareButtons'
import ProjectStepTabs from '@shared/projectFrise/ProjectStepTabs'
import Play from '@shared/projectFrise/SVG/Play'
import { getSrcSet } from '@shared/ui/Image'
import { pxToRem } from '@shared/utils/pxToRem'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import useIsMobile from '@shared/hooks/useIsMobile'
import DefaultProjectImage from '@shared/sections/carrousel/DefaultProjectImage'
import htmlDecode from '@shared/utils/htmlDecode'
import VoteStepProjectHeroStats from './VoteStepProjectHeroStats'

type Props = {
  step: VoteStepProjectHero_proposalStep$key
}

type Project = NonNullable<VoteStepProjectHero_proposalStep$data['project']>
type RestrictedViewerGroup = NonNullable<
  NonNullable<NonNullable<Project['restrictedViewers']>['edges']>[number]
>['node']

const FRAGMENT = graphql`
  fragment VoteStepProjectHero_proposalStep on ProposalStep {
    id
    project {
      title
      url
      adminAlphaUrl
      video
      cover {
        url
        name
      }
      archived
      visibility
      authors {
        __typename
        id
        url
        username
        avatarUrl
        ... on User {
          userType {
            name
          }
          media {
            url
          }
        }
      }
      themes {
        id
        title
        url
      }
      districts {
        totalCount
        edges {
          node {
            id
            name
          }
        }
      }
      restrictedViewers(first: 100) {
        totalUserCount
        edges {
          node {
            id
            title
            users(first: 100) {
              edges {
                node {
                  id
                  username
                  url
                  avatarUrl
                  ... on User {
                    media {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
      ...ProjectStepTabs_project
      ...VoteStepProjectHeroStats_project
    }
  }
`

const BREAKING_NUMBER = 3
type OpenedModal = 'authors' | 'districts' | 'themes' | 'restrictedViewers' | null

const InfoItem: React.FC<{
  icon: CapUIIcon
  children: React.ReactNode
  href?: string | null
  onClick?: () => void
  className: string
  underlineOnHover?: boolean
}> = ({ icon, children, href, onClick, className, underlineOnHover = false }) => {
  const isInteractive = !!href || !!onClick

  const content = (
    <>
      <Icon
        color="neutral-gray.500"
        size={CapUIIconSize.Md}
        name={icon}
        marginLeft={icon === CapUIIcon.PinO ? '-5px' : '-3px'}
      />
      <Text
        className="platform__body"
        fontSize={[CapUIFontSize.Caption, CapUIFontSize.BodySmall]}
        lineHeight={icon === CapUIIcon.PinO ? 'sm' : CapUILineHeight.S}
        fontWeight="normal"
        color="gray.900"
        truncate={35}
      >
        {children}
      </Text>
    </>
  )

  const commonProps = {
    className,
    display: 'flex' as const,
    flexDirection: 'row' as const,
    justifyContent: 'flex-start' as const,
    alignItems: 'center' as const,
    marginBottom: 0,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    paddingRight: 2,
    sx: {
      listStyle: 'none',
      cursor: isInteractive ? 'pointer' : 'default',
      color: 'inherit',
      '&:hover p': {
        textDecoration: href || underlineOnHover ? 'underline' : undefined,
      },
    },
  }

  if (href) {
    return (
      <Box as="a" href={href} {...commonProps}>
        {content}
      </Box>
    )
  }

  if (onClick) {
    return (
      <Box as="button" type="button" onClick={onClick} {...commonProps}>
        {content}
      </Box>
    )
  }

  return (
    <Box as="li" {...commonProps}>
      {content}
    </Box>
  )
}

const VoteStepProjectHero: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()
  const isMobile = useIsMobile()
  const profiles = useFeatureFlag('profiles')
  const { siteColors } = useAppContext()
  const primaryColor = siteColors?.primaryColor || '#546E7A'
  const linkColor = siteColors?.linkColor || 'inherit'
  const linkHoverColor = siteColors?.linkHoverColor || linkColor

  const { project } = step
  const [openedModal, setOpenedModal] = React.useState<OpenedModal>(null)
  const [openedRestrictedGroupId, setOpenedRestrictedGroupId] = React.useState<string | null>(null)
  const closeModal = () => setOpenedModal(null)

  if (!project) return null

  const firstAuthor = project.authors?.[0]
  const showFirstAuthorProfileLink = profiles || firstAuthor?.__typename === 'Organization'
  const authorsLabel = (() => {
    if (!firstAuthor) return null

    const firstAuthorUsername = firstAuthor.username ?? ''
    const remainingAuthorsLength = project.authors.length - 1

    if (remainingAuthorsLength === 0) return firstAuthorUsername
    if (remainingAuthorsLength === 1) {
      return intl.formatMessage(
        { id: 'avatar-group-shownames-2' },
        { first: firstAuthorUsername, second: project.authors[1].username ?? '' },
      )
    }

    return intl.formatMessage(
      { id: 'avatar-group-shownames' },
      { name: firstAuthorUsername, length: remainingAuthorsLength },
    )
  })()
  const districts = project.districts?.edges?.map(edge => edge?.node).filter(Boolean) ?? []
  const restrictedGroups =
    project.restrictedViewers?.edges
      ?.map(edge => edge?.node)
      .filter((group): group is RestrictedViewerGroup => !!group) ?? []
  const title = htmlDecode(project.title)
  const getAvatarUrl = (author: Project['authors'][number]) => author.avatarUrl || (author as any).media?.url
  const authorsCount = project.authors.length
  const hiddenAuthorsCount = Math.max(authorsCount - BREAKING_NUMBER, 0)
  const avatarSize = isMobile ? 56 : 40

  const renderAuthorsAvatars = () => (
    <Flex
      className="projectHeader__authors platform__body"
      minHeight={isMobile ? 13 : 9}
      marginTop={[-8, 0]}
      flexWrap="nowrap"
    >
      {project.authors.slice(0, 3).map((author, index) => (
        <Avatar
          key={author.id}
          size={isMobile ? 'xl' : 'lg'}
          name={author.username ?? ''}
          src={getAvatarUrl(author)}
          marginLeft={index === 0 ? 0 : '-8px'}
          border="2px solid white"
          zIndex={index + 1}
        />
      ))}
      {hiddenAuthorsCount > 0 ? (
        <Flex
          alignItems="center"
          justifyContent="center"
          width={`${avatarSize}px`}
          height={`${avatarSize}px`}
          minWidth={`${avatarSize}px`}
          marginLeft="-8px"
          border="2px solid white"
          borderRadius="50%"
          backgroundColor="blue.500"
          color="white"
          fontWeight={600}
          fontSize={isMobile ? CapUIFontSize.BodySmall : CapUIFontSize.Caption}
          zIndex={0}
        >
          +{hiddenAuthorsCount}
        </Flex>
      ) : null}
    </Flex>
  )

  const renderAuthorsCredit = () => (
    <Text
      id="authors-credit"
      className="platform__body"
      fontWeight={400}
      lineHeight="24px"
      color="neutral-gray.900"
      paddingLeft={2}
      fontSize="14px"
      sx={{
        '&:hover': {
          textDecoration: showFirstAuthorProfileLink || project.authors.length > 1 ? 'underline' : 'none',
          cursor: showFirstAuthorProfileLink || project.authors.length > 1 ? 'pointer' : 'default',
        },
      }}
    >
      {authorsLabel}
    </Text>
  )

  const authorsDisclosure = (
    <Flex
      alignItems="center"
      zIndex={2}
      flexWrap="wrap"
      width="85%"
      as={project.authors.length > 1 ? 'button' : 'div'}
      onClick={project.authors.length > 1 ? () => setOpenedModal('authors') : undefined}
      border="none"
      backgroundColor="transparent"
      p={0}
    >
      {renderAuthorsAvatars()}
      {project.authors.length === 1 && showFirstAuthorProfileLink ? (
        <Box as="a" href={firstAuthor?.url} color="inherit">
          {renderAuthorsCredit()}
        </Box>
      ) : (
        renderAuthorsCredit()
      )}
    </Flex>
  )

  const renderAuthors = () => {
    if (!firstAuthor || !authorsLabel) return null

    if (project.authors.length <= 1) return authorsDisclosure

    return (
      <>
        {authorsDisclosure}
        <Modal
          baseId="project-header-authors-modal"
          ariaLabel={intl.formatMessage({ id: 'global.authors' })}
          size={CapUIModalSize.Md}
          show={openedModal === 'authors'}
          onClose={closeModal}
        >
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'global.authors' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Box as="ul" p={0} m={0}>
              {project.authors.map(author => (
                <Flex key={author.id} as="li" alignItems="center" gap={2} py={2} sx={{ listStyle: 'none' }}>
                  <Avatar size="md" name={author.username ?? ''} src={getAvatarUrl(author)} />
                  <Flex direction="column">
                    {profiles || author.__typename === 'Organization' ? (
                      <Box as="a" href={author.url} color="neutral-gray.900">
                        {author.username}
                      </Box>
                    ) : (
                      <Text color="neutral-gray.900">{author.username}</Text>
                    )}
                    {'userType' in author && author.userType?.name ? (
                      <Text color="neutral-gray.500" fontSize={CapUIFontSize.Caption}>
                        {author.userType.name}
                      </Text>
                    ) : null}
                  </Flex>
                </Flex>
              ))}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={closeModal}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  const renderDistricts = () => {
    if (districts.length === 0) return null

    if (project.districts?.totalCount && project.districts.totalCount <= BREAKING_NUMBER) {
      return districts.map(district => (
        <InfoItem key={district.id} className="projectHeader__info__location" icon={CapUIIcon.PinO}>
          {district.name}
        </InfoItem>
      ))
    }

    return (
      <>
        <InfoItem
          className="projectHeader__info__location"
          icon={CapUIIcon.PinO}
          onClick={() => setOpenedModal('districts')}
        >
          <>
            {districts[0]?.name}{' '}
            {intl.formatMessage(
              { id: 'and-count-other-areas' },
              { count: (project.districts?.totalCount ?? districts.length) - 1 },
            )}
          </>
        </InfoItem>
        <Modal
          baseId="project-header-district-list-modal"
          ariaLabel={intl.formatMessage({ id: 'data_district_list' })}
          size={CapUIModalSize.Lg}
          show={openedModal === 'districts'}
          onClose={closeModal}
        >
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'count-area' }, { count: project.districts?.totalCount ?? 0 })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Box as="ul" p={0} m={0}>
              {districts.map(district => (
                <Box key={district.id} as="li" py={2} sx={{ listStyle: 'none' }}>
                  {district.name}
                </Box>
              ))}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={closeModal}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  const renderThemes = () => {
    if (!project.themes?.length) return null

    if (project.themes.length <= BREAKING_NUMBER) {
      return project.themes.map(theme => (
        <InfoItem key={theme.id} className="projectHeader__info__theme" icon={CapUIIcon.FolderO} href={theme.url}>
          {theme.title}
        </InfoItem>
      ))
    }

    return (
      <>
        <InfoItem
          className="projectHeader__info__theme"
          icon={CapUIIcon.FolderO}
          onClick={() => setOpenedModal('themes')}
          underlineOnHover
        >
          <>
            {project.themes[0]?.title}{' '}
            {intl.formatMessage({ id: 'and-count-other-themes' }, { count: project.themes.length - 1 })}
          </>
        </InfoItem>
        <Modal
          baseId="theme-modal"
          ariaLabel={intl.formatMessage({ id: 'theme_list' })}
          size={CapUIModalSize.Md}
          show={openedModal === 'themes'}
          onClose={closeModal}
        >
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'count-themes' }, { count: project.themes.length })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Box as="ul" p={0} m={0}>
              {project.themes.map(theme => (
                <Box key={theme.id} as="li" py={2} sx={{ listStyle: 'none' }}>
                  <Box
                    as="a"
                    href={theme.url}
                    color={linkColor}
                    sx={{
                      '&:hover': {
                        color: linkHoverColor,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {theme.title}
                  </Box>
                </Box>
              ))}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={closeModal}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  const renderRestrictedAccess = () => {
    if (project.archived && project.visibility === 'PUBLIC') {
      return (
        <Box position="absolute" top="12px" right="10px" zIndex={2}>
          <Tag id="archived-tag" variantColor="infoGray" color="neutral-gray.500" as="div">
            <Flex>
              <Icon name={CapUIIcon.FolderO} />
              <Text color="neutral-gray.800" fontWeight={600}>
                {intl.formatMessage({ id: 'global-archived' })}
              </Text>
            </Flex>
          </Tag>
        </Box>
      )
    }

    if (project.visibility === 'PUBLIC') return null

    const visibleBy =
      project.visibility === 'CUSTOM'
        ? intl.formatMessage({ id: 'only-visible-by' }, { num: project.restrictedViewers?.totalUserCount ?? 0 })
        : intl.formatMessage({
            id: project.visibility === 'ME' ? 'global.draft.only_visible_by_you' : 'only-visible-by-administrators',
          })

    const tag = (
      <Tag
        id="restricted-access"
        variantColor="infoGray"
        onClick={project.visibility === 'CUSTOM' ? () => setOpenedModal('restrictedViewers') : undefined}
      >
        <Icon name={CapUIIcon.Lock} />
        {intl.formatMessage({ id: 'restrictedaccess' })}
      </Tag>
    )
    const openedRestrictedGroup = restrictedGroups.find(group => group.id === openedRestrictedGroupId)

    if (project.visibility !== 'CUSTOM') {
      return (
        <Box position="absolute" top="12px" right="10px" zIndex={2}>
          <Tooltip label={visibleBy}>{tag}</Tooltip>
        </Box>
      )
    }

    return (
      <Box position="absolute" top="12px" right="10px" zIndex={2}>
        <Tooltip label={visibleBy}>{tag}</Tooltip>
        <Modal
          baseId="project-header-restricted-viewers-modal"
          ariaLabel={intl.formatMessage({ id: 'groups-with-access-to-project' })}
          size={CapUIModalSize.Lg}
          show={openedModal === 'restrictedViewers'}
          onClose={closeModal}
        >
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'people-with-access-to-project' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Box as="ul" p={0} m={0}>
              {restrictedGroups.map(group => (
                <Box key={group.id} as="li" py={2} sx={{ listStyle: 'none' }}>
                  <Button
                    variant="link"
                    variantSize="medium"
                    p={0}
                    title={intl.formatMessage({ id: 'persons-in-the-group' }, { groupName: group.title })}
                    onClick={() => setOpenedRestrictedGroupId(group.id)}
                  >
                    {group.title}
                  </Button>
                </Box>
              ))}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={closeModal}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          baseId={openedRestrictedGroup ? `${openedRestrictedGroup.id}-modal` : 'project-header-restricted-group-modal'}
          ariaLabel={intl.formatMessage({ id: 'people-with-access-to-project' })}
          size={CapUIModalSize.Lg}
          show={!!openedRestrictedGroup}
          onClose={() => setOpenedRestrictedGroupId(null)}
        >
          <Modal.Header>
            <Heading>{openedRestrictedGroup?.title}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Box as="ul" p={0} m={0}>
              {openedRestrictedGroup?.users?.edges
                ?.map(edge => edge?.node)
                .filter(Boolean)
                .map(user => (
                  <Flex key={user.id} as="li" alignItems="center" gap={2} py={2} sx={{ listStyle: 'none' }}>
                    <Avatar size="md" name={user.username ?? ''} src={user.avatarUrl || (user as any).media?.url} />
                    <Box
                      as="a"
                      href={user.url}
                      title={intl.formatMessage({ id: 'usernames-profile' }, { userName: user.username })}
                      color="neutral-gray.900"
                    >
                      {user.username}
                    </Box>
                  </Flex>
                ))}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" variantSize="medium" onClick={() => setOpenedRestrictedGroupId(null)}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </Box>
    )
  }

  const renderVideoDisclosure = () => {
    if (!project.video) return null

    return (
      <Modal
        size={CapUIModalSize.Md}
        baseId="project-header-cover-modal"
        ariaLabel={intl.formatMessage({ id: 'project-header-video-modal' })}
        fullSizeOnMobile
        height={isMobile ? '64%' : '60%'}
        width={isMobile ? '90%' : '60%'}
        disclosure={
          <Flex
            as="button"
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            alignItems="center"
            justifyContent="center"
            border="none"
            backgroundColor="transparent"
            sx={{ cursor: 'pointer' }}
            aria-label={intl.formatMessage({ id: 'project-header-video-modal' })}
          >
            <Play />
          </Flex>
        }
      >
        <iframe
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          src={project.video}
          width="100%"
          height="100%"
        />
      </Modal>
    )
  }

  return (
    <Box
      backgroundColor="white"
      as="header"
      role="banner"
      className="projectHeader"
      maxWidth="100%"
      paddingY={[0, 9]}
      mb="md"
      borderBottom="1px solid #e3e3e3"
    >
      <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" px={[0, 'lg']}>
        <Box
          className="projectHeader__cover"
          position="relative"
          display="flex"
          flexDirection={['column-reverse', 'row']}
          flexWrap="nowrap"
          width="100%"
          justifyContent="center"
        >
          <Box
            className="projectHeader__cover__content"
            position="relative"
            display="flex"
            flexDirection="column"
            minHeight={['auto', '270px']}
            justifyContent="flex-start"
            alignItems="flex-start"
            paddingLeft={[4, 0]}
            paddingRight={[4, 6]}
            width={['100%', 'calc(100% - 405px)']}
          >
            {renderAuthors()}

            <Text
              className="projectHeader__title platform__title"
              width="100%"
              as="h1"
              mb={0}
              fontSize={[CapUIFontSize.Headline, CapUIFontSize.DisplayMedium]}
              lineHeight="initial"
              fontWeight="semibold"
              color="neutral-gray.900"
              marginTop={2}
              truncate={130}
            >
              {title}
            </Text>

            <VoteStepProjectHeroStats project={project} />

            {project.districts?.edges?.length || project.themes?.length ? (
              <Box
                className="projectHeader__info"
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                width="100%"
                flexBasis="100%"
                alignItems="flex-end"
                marginTop={[0, 6]}
                marginBottom={0}
                maxHeight="24px"
                justifyContent="flex-start"
                as="ul"
                p={0}
              >
                {renderDistricts()}
                {renderThemes()}
              </Box>
            ) : null}

            <ShareButtons url={project.url} title={title} />
          </Box>

          <Box
            className="projectHeader__coverImage"
            width={['100%', '405px']}
            overflow="hidden"
            minHeight="270px"
            maxHeight="315px"
            sx={{
              filter: project.archived ? 'grayscale(1)' : null,
              opacity: project.archived ? '50%' : null,
            }}
          >
            {project.cover?.url ? (
              <Box position="relative" width="100%" height="100%" minHeight="270px">
                <Box
                  as="img"
                  {...getSrcSet(project.cover.url)}
                  alt=""
                  loading="eager"
                  sizes="(max-width: 640px) 640px, 960px"
                  width={['100%', '405px']}
                  minHeight="270px"
                  borderRadius={[0, 'accordion']}
                  style={{ objectFit: 'cover' }}
                />
                {renderVideoDisclosure()}
              </Box>
            ) : (
              <Flex
                alignItems="center"
                justifyContent="center"
                width="100%"
                minHeight="270px"
                backgroundColor={primaryColor}
                position="relative"
              >
                <DefaultProjectImage position="relative" top={0} left={0} />
                {renderVideoDisclosure()}
              </Flex>
            )}
          </Box>
          {renderRestrictedAccess()}
        </Box>
        <ProjectStepTabs
          project={project}
          currentStepId={step.id}
          mainColor={primaryColor}
          marginBottom={[-8, -13]}
          marginTop={3}
        />
      </Box>
    </Box>
  )
}

export default VoteStepProjectHero
