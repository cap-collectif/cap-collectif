import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { useState } from 'react'
import { Modal, Heading, CapUIIcon, Button, Flex, Text } from '@cap-collectif/ui'
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer'
import DebateStepPageAlternateArgumentsPagination, {
  CONNECTION_CONFIG,
} from '~/components/Debate/Page/Arguments/DebateStepPageAlternateArgumentsPagination'
import type { DebateStepPageArgumentsDrawer_debate$key } from '~relay/DebateStepPageArgumentsDrawer_debate.graphql'
import type { DebateStepPageArgumentsDrawer_viewer$key } from '~relay/DebateStepPageArgumentsDrawer_viewer.graphql'
import type { RelayHookPaginationProps as PaginationProps } from '~/types'
import { CONNECTION_NODES_PER_PAGE } from '~/components/Debate/Page/Arguments/DebateStepPageArgumentsPagination'
import type { Filter } from '~/components/Debate/Page/Arguments/types'
import ListOptionGroup from '~ds/List/ListOptionGroup'
import ResetCss from '~/utils/ResetCss'
const DEBATE_FRAGMENT = graphql`
  fragment DebateStepPageArgumentsDrawer_debate on Debate @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    arguments(first: 0, isPublished: true, isTrashed: false) {
      totalCount
    }
    forArguments: arguments(first: 0, value: FOR, isPublished: true, isTrashed: false) {
      totalCount
    }
    againstArguments: arguments(first: 0, value: AGAINST, isPublished: true, isTrashed: false) {
      totalCount
    }
    ...DebateStepPageAlternateArgumentsPagination_debate
      @arguments(isAuthenticated: $isAuthenticated, orderBy: { field: PUBLISHED_AT, direction: DESC })
  }
`
const VIEWER_FRAGMENT = graphql`
  fragment DebateStepPageArgumentsDrawer_viewer on User {
    ...DebateStepPageAlternateArgumentsPagination_viewer
  }
`
type Props = {
  readonly isOpen: boolean
  readonly onClose?: () => void
  readonly debate: DebateStepPageArgumentsDrawer_debate$key
  readonly viewer: DebateStepPageArgumentsDrawer_viewer$key | null | undefined
}

const DebateStepPageArgumentsDrawer = ({
  debate: debateFragment,
  viewer: viewerFragment,
  ...drawerProps
}: Props): JSX.Element => {
  const intl = useIntl()
  const debate = useFragment(DEBATE_FRAGMENT, debateFragment)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const [filter, setFilter] = useState<Filter>('DESC')
  const [connection, setConnection] = useState<
    | (PaginationProps & {
        hasMore: boolean
      })
    | null
    | undefined
  >(null)
  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Header textAlign="center" display="grid" gridTemplateColumns="1fr 10fr 1fr">
        <Flex direction="column">
          <Text fontWeight="bold">
            <FormattedMessage
              tagName={React.Fragment}
              id="shortcut.opinion"
              values={{
                num: debate.arguments.totalCount,
              }}
            />
          </Text>
          <Text color="neutral-gray.700">
            <FormattedMessage
              tagName={React.Fragment}
              id="vote-count-for-and-against"
              values={{
                for: debate.forArguments.totalCount,
                against: debate.againstArguments.totalCount,
              }}
            />
          </Text>
        </Flex>

        <Modal
          disclosure={
            <Button rightIcon={CapUIIcon.ArrowDown} color="gray.500">
              <FormattedMessage tagName={React.Fragment} id="argument.sort.label" />
            </Button>
          }
          ariaLabel={intl.formatMessage({
            id: 'arguments.sort',
          })}
        >
          {({ hide }) => (
            <>
              <ResetCss>
                <Modal.Header>
                  <Heading as="h4">
                    {intl.formatMessage({
                      id: 'arguments.sort',
                    })}
                  </Heading>
                </Modal.Header>
              </ResetCss>
              <Modal.Body pb={6}>
                <ListOptionGroup
                  value={filter}
                  onChange={newFilter => {
                    setFilter(newFilter as any as Filter)
                    const field = newFilter === 'MOST_SUPPORTED' ? 'VOTE_COUNT' : 'PUBLISHED_AT'
                    const direction = newFilter === 'MOST_SUPPORTED' ? 'DESC' : newFilter
                    if (connection)
                      connection.refetchConnection(CONNECTION_CONFIG, CONNECTION_NODES_PER_PAGE, null, {
                        orderBy: {
                          field,
                          direction,
                        },
                        debateId: debate?.id,
                      })
                    hide()
                  }}
                  type="radio"
                >
                  <ListOptionGroup.Item value="DESC">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="project.sort.last" />
                    </Text>
                  </ListOptionGroup.Item>
                  <ListOptionGroup.Item value="ASC">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="opinion.sort.old" />
                    </Text>
                  </ListOptionGroup.Item>
                  <ListOptionGroup.Item value="MOST_SUPPORTED">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="filter.most_supported" />
                    </Text>
                  </ListOptionGroup.Item>
                </ListOptionGroup>
              </Modal.Body>
            </>
          )}
        </Modal>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex overflow="auto" height="100%" direction="column" spacing={4}>
          <DebateStepPageAlternateArgumentsPagination
            handleChange={value => {
              if (value.hasMore !== connection?.hasMore) setConnection(value)
            }}
            debate={debate}
            viewer={viewer}
          />
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  )
}

export default DebateStepPageArgumentsDrawer
