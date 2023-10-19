import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import type { GraphQLTaggedNode } from 'react-relay'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import AppBox from '~ui/Primitives/AppBox'
import Flex from '~ui/Primitives/Layout/Flex'
import Spinner from '~ds/Spinner/Spinner'
import type { ProjectContributors_project$key } from '~relay/ProjectContributors_project.graphql'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
export const USERS_PAGINATION = 20
export const ProjectContributorsQuery: GraphQLTaggedNode = graphql`
  fragment ProjectContributors_project on Project
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    isAdmin: { type: "Boolean!" }
    emailConfirmed: { type: "Boolean!" }
  )
  @refetchable(queryName: "ProjectContributorsPaginationQuery") {
    id
    emailableContributors(first: $count, after: $cursor)
      @connection(key: "ProjectContributors_emailableContributors", filters: []) {
      totalCount
      refusingCount
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          email @include(if: $isAdmin)
          username
        }
      }
    }
  }
`
type Props = {
  readonly project: ProjectContributors_project$key
  readonly isAdmin: boolean
}
export const ProjectContributors = ({ project, isAdmin }: Props) => {
  const ProjectContributorsRef = React.useRef(null)
  const intl = useIntl()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(ProjectContributorsQuery, project)
  const consentingContributors =
    data.emailableContributors.edges
      ?.filter(Boolean)
      .map(e => e.node)
      .filter(Boolean) ?? []
  const firstRendered = React.useRef(null)
  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        isAdmin,
      })
    }

    firstRendered.current = true
  }, [isAdmin, refetch])
  return (
    <AppBox
      as="ul"
      p={0}
      m={0}
      css={{
        listStyle: 'none',
        overflow: 'auto',
        maxHeight: '300px',
      }}
      ref={ProjectContributorsRef}
    >
      {data.emailableContributors.refusingCount > 0 && (
        <InfoMessage variant="info" mb={6}>
          <InfoMessage.Title>
            {intl.formatMessage(
              {
                id: 'mailingList-refusing-members-count',
              },
              {
                num: data.emailableContributors.refusingCount,
              },
            )}
          </InfoMessage.Title>
          <InfoMessage.Content>
            {intl.formatMessage(
              {
                id: 'mailingList-refusing-members',
              },
              {
                num: data.emailableContributors.refusingCount,
              },
            )}
          </InfoMessage.Content>
        </InfoMessage>
      )}
      <InfiniteScroll
        key="infinite-scroll-internal-members"
        initialLoad={false}
        pageStart={0}
        loadMore={() => loadNext(USERS_PAGINATION)}
        hasMore={hasNext}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        getScrollParent={() => ProjectContributorsRef.current}
        useWindow={false}
      >
        {consentingContributors.map(contributor => (
          <AppBox as="li" key={contributor.email} mb={3} color="gray.900" fontWeight="400">
            {contributor.email ??
              contributor.username ??
              intl.formatMessage({
                id: 'global.anonymous',
              })}
          </AppBox>
        ))}
      </InfiniteScroll>
    </AppBox>
  )
}
export default ProjectContributors
