import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useFragment } from 'relay-hooks'
import { Heading, Box, Button, Flex } from '@cap-collectif/ui'
import type {
  MobileDebateStepPageArguments_debate,
  MobileDebateStepPageArguments_debate$key,
} from '~relay/MobileDebateStepPageArguments_debate.graphql'
import type {
  MobileDebateStepPageArguments_viewer,
  MobileDebateStepPageArguments_viewer$key,
} from '~relay/MobileDebateStepPageArguments_viewer.graphql'
import DebateStepPageAlternateArgumentsPagination from '~/components/Debate/Page/Arguments/DebateStepPageAlternateArgumentsPagination'
import DebateStepPageArgumentsDrawer from '~/components/Debate/Page/Drawers/DebateStepPageArgumentsDrawer'
type Props = {
  readonly debate: MobileDebateStepPageArguments_debate$key
  readonly viewer: MobileDebateStepPageArguments_viewer$key | null | undefined
}
const DEBATE_FRAGMENT = graphql`
  fragment MobileDebateStepPageArguments_debate on Debate @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    arguments(first: 0, isPublished: true, isTrashed: false) {
      totalCount
    }
    ...DebateStepPageArgumentsDrawer_debate @arguments(isAuthenticated: $isAuthenticated)
    ...DebateStepPageAlternateArgumentsPagination_debate
      @arguments(isAuthenticated: $isAuthenticated, orderBy: { field: PUBLISHED_AT, direction: DESC })
  }
`
const VIEWER_FRAGMENT = graphql`
  fragment MobileDebateStepPageArguments_viewer on User {
    ...DebateStepPageArgumentsDrawer_viewer
    ...DebateStepPageAlternateArgumentsPagination_viewer
  }
`
export const MobileDebateStepPageArguments = ({
  debate: debateFragment,
  viewer: viewerFragment,
}: Props): JSX.Element => {
  const debate: MobileDebateStepPageArguments_debate = useFragment(DEBATE_FRAGMENT, debateFragment)
  const viewer: MobileDebateStepPageArguments_viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const { isOpen, onClose, onOpen } = useDisclosure()
  if (!debate) return null
  const argumentsCount: number = debate.arguments?.totalCount ?? 0
  return (
    <Box id="DebateStepPageArguments">
      <DebateStepPageArgumentsDrawer onClose={onClose} isOpen={isOpen} debate={debate} viewer={viewer} />
      <Flex direction="row" justifyContent="space-between" mb={6}>
        <Heading as="h3" fontWeight="400" capitalize>
          <FormattedMessage
            id="shortcut.opinion"
            values={{
              num: argumentsCount,
            }}
          />
        </Heading>
        <Button onClick={onOpen} variant="link" ml="auto">
          <FormattedMessage id="global.show_all" />
        </Button>
      </Flex>
      <Flex direction="row">
        <DebateStepPageAlternateArgumentsPagination debate={debate} viewer={viewer} preview />
      </Flex>
    </Box>
  )
}
export default MobileDebateStepPageArguments
