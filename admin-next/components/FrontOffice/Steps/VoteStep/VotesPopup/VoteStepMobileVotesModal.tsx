import {
  Box,
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  CapUIModalSize,
  Icon,
  Modal,
} from '@cap-collectif/ui'
import { VoteStepMobileVotesModal_proposalStep$key } from '@relay/VoteStepMobileVotesModal_proposalStep.graphql'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VotesPopup from './VotesPopup'
import VoteStepUserInfos from '../VoteStepUserInfos'

type Props = {
  step: VoteStepMobileVotesModal_proposalStep$key
  isActive?: boolean
  onButtonClick?: () => void
}

const FRAGMENT = graphql`
  fragment VoteStepMobileVotesModal_proposalStep on ProposalStep {
    ...VotesPopup_proposalStep
    ...VoteStepUserInfos_proposalStep
    voteType
    budget
    votesLimit
    votesMin
    viewerVotes {
      totalCount
      edges {
        node {
          proposal {
            estimation
          }
        }
      }
    }
  }
`

const VoteStepMobileVotesModal: FC<Props> = ({ step: stepKey, isActive = false, onButtonClick }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)

  return (
    <Modal
      show={isActive}
      disclosure={
        <Button
          variant={isActive ? 'primary' : 'tertiary'}
          flexDirection="column"
          flex="1 0 0"
          onClick={() => onButtonClick?.()}
        >
          <Icon name={CapUIIcon.ThumbUpO} size={CapUIIconSize.Md} />
          <Box as="span" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S}>
            {intl.formatMessage({ id: 'global.vote' })}
          </Box>
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: 'proposal.step.user.votes.infos.btn.votes' })}
      size={CapUIModalSize.Fullscreen}
      fullSizeOnMobile
      hideCloseButton
      alwaysOpenInPortal
      hideOnClickOutside={false}
    >
      <Modal.Body pt="md">
        <VoteStepUserInfos step={step} />
        <Box mt="xs">
          <VotesPopup step={step} />
        </Box>
      </Modal.Body>
    </Modal>
  )
}

export default VoteStepMobileVotesModal
