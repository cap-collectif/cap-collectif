import * as React from 'react'
import { Box } from '@cap-collectif/ui'
import VoteInfoPanel from './Filters/VoteInfoPanel/VoteInfoPanel'
import VoteStepPageAnonymousToggle from './VoteStepPageAnonymousToggle'

type Props = {
  readonly stepId: string
}

const VotesInfo = ({ stepId }: Props) => {
  return (
    <Box width="100%" minHeight="100vh" py={8} pr={0} pl={4}>
      <VoteInfoPanel stepId={stepId} />
      <VoteStepPageAnonymousToggle stepId={stepId} />
    </Box>
  )
}

export default VotesInfo
