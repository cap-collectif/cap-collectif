import { Box, CapUIFontSize, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import htmlDecode from '~/components/Utils/htmlDecode'
import { formatBigNumber } from '~/utils/bigNumberFormatter'
import type { ProjectHeaderIdf_project$key } from '~relay/ProjectHeaderIdf_project.graphql'

const LINKS = [
  { id: 'projectHeaderIdfLink-home', label: 'Accueil', href: '/' },
  { id: 'projectHeaderIdfLink-help', label: "Besoin d'aide ?", href: 'https://smartidf.services/fr/contact' },
]

export const FRAGMENT = graphql`
  fragment ProjectHeaderIdf_project on Project {
    isVotesCounterDisplayable
    isContributionsCounterDisplayable
    isParticipantsCounterDisplayable
    contributions {
      totalCount
    }
    contributors {
      totalCount
    }
    votes {
      totalCount
    }
    paperVotesTotalCount
  }
`

type Props = {
  readonly project: ProjectHeaderIdf_project$key | null
  readonly title: string | null | undefined
  readonly showCounters?: boolean
}

const Counter = ({ label, value }: { label: string; value: number }) => (
  <Flex direction="column" spacing={1} minWidth="max-content">
    <Text fontSize={CapUIFontSize.BodySmall} fontWeight="semibold" color="inherit">
      {label}
    </Text>
    <Text fontSize={CapUIFontSize.Headline} fontWeight="semibold" color="inherit">
      {formatBigNumber(value)}
    </Text>
  </Flex>
)

const ProjectHeaderIdf = ({ project, title, showCounters = true }: Props): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const data = useFragment(FRAGMENT, project)
  const counters = React.useMemo(() => {
    const votesTotalCount = (data?.votes?.totalCount ?? 0) + (data?.paperVotesTotalCount ?? 0)
    const participantsTotalCount = data?.contributors?.totalCount

    return [
      data?.isContributionsCounterDisplayable
        ? { label: 'Contributions', value: data?.contributions?.totalCount }
        : null,
      data?.isVotesCounterDisplayable && votesTotalCount > 0 ? { label: 'Votes', value: votesTotalCount } : null,
      data?.isParticipantsCounterDisplayable ? { label: 'Participants', value: participantsTotalCount } : null,
    ].filter(Boolean) as Array<{ label: string; value: number }>
  }, [data])

  // used to make the header take up all the page width and not just the container width
  React.useEffect(() => {
    const header = document.querySelector('.projectHeaderIdf')
    if (!header) {
      return
    }

    const container = header.closest('.container')
    if (!container || container.classList.contains('container-fluid')) {
      return
    }

    container.classList.add('container-fluid')
    container.classList.remove('container')

    return () => {
      container.classList.remove('container-fluid')
      container.classList.add('container')
    }
  }, [])

  const renderLinkItems = (idSuffix = '') =>
    LINKS.map(link => (
      <Text
        key={link.id}
        id={`${link.id}${idSuffix}`}
        as="a"
        href={link.href}
        fontSize={[CapUIFontSize.BodySmall, CapUIFontSize.BodyRegular]}
        fontWeight="regular"
        color="inherit"
        sx={{
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline', color: 'inherit' },
          '&:focus': { textDecoration: 'underline', color: 'inherit' },
        }}
      >
        {link.label}
      </Text>
    ))

  return (
    <Flex
      className="projectHeaderIdf"
      direction="row"
      alignItems={['flex-start', 'center']}
      justifyContent="space-between"
      width="100%"
      bg={'transparent'}
      color="white"
      paddingY={[6, 4]}
      paddingX={[4, 8]}
      minHeight="94px"
      sx={{ '& *': { color: 'inherit' } }}
    >
      {/* Left: title + counters */}
      <Flex
        direction={['column', 'row']}
        alignItems={['flex-start', 'center']}
        // @ts-ignore: legacy code, error on spacing prop won't be fixed
        spacing={[2, 8]}
        flexWrap="wrap"
        flex="1"
        alignSelf="center"
      >
        <Text
          id="projectHeaderIdfTitle"
          as="h1"
          fontSize={
            showCounters
              ? [CapUIFontSize.BodySmall, CapUIFontSize.BodyRegular]
              : [CapUIFontSize.BodyRegular, CapUIFontSize.BodyLarge]
          }
          fontWeight="semibold"
          color="inherit"
          alignSelf="start"
        >
          {htmlDecode(title)}
        </Text>
        {showCounters && counters.length > 0 && (
          <Flex id="projectHeaderIdfCounters" direction="row" alignItems="center" gap={[4, 8]} flexWrap="wrap">
            {counters.map(counter => (
              <Counter key={counter.label} label={counter.label} value={counter.value} />
            ))}
          </Flex>
        )}
      </Flex>

      {/* Right: mobile burger block */}
      <Flex display={['flex', 'none']} direction="column" flex="1">
        <Box
          alignSelf="flex-end"
          onClick={() => setIsMenuOpen(prev => !prev)}
          border="1px solid"
          borderColor="rgba(255,255,255,0.5)"
          borderRadius="4px"
          padding={2}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Ouvrir le menu"
          aria-expanded={isMenuOpen}
        >
          <Icon name={CapUIIcon.Burger} size={CapUIIconSize.Md} color="inherit" />
        </Box>
        {isMenuOpen && (
          <>
            <Box width="100%" height="1px" bg="rgba(255,255,255,0.3)" marginY={3} />
            <Flex
              id="projectHeaderIdfLinksMobile"
              className="idfSubnav"
              direction="column"
              alignItems="flex-start"
              // @ts-ignore legacy code, error on spacing prop won't be fixed
              spacing={4}
            >
              {renderLinkItems('-mobile')}
            </Flex>
          </>
        )}
      </Flex>

      {/* Right: desktop links */}
      <Flex
        id="projectHeaderIdfLinksDesktop"
        className="idfSubnav"
        display={['none', 'flex']}
        direction="row"
        alignItems="center"
        spacing={6}
        paddingX={'45px'}
      >
        {renderLinkItems()}
      </Flex>
    </Flex>
  )
}

export default ProjectHeaderIdf
