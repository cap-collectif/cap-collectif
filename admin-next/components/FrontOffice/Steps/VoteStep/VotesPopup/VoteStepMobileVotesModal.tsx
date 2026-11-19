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
import { pxToRem } from '@shared/utils/pxToRem'
import { getVoteAction, VoteAction } from '@shared/utils/getVoteAction'

type Props = {
  step: VoteStepMobileVotesModal_proposalStep$key
  isActive?: boolean
  onButtonClick?: () => void
  onClose?: () => void
}

const VOTE_ACTION_LABEL_IDS: Record<VoteAction, { tabLabelId: string; ariaLabelId: string }> = {
  VOTE: { tabLabelId: 'global.vote', ariaLabelId: 'proposal.step.user.votes.infos.btn.votes' },
  SUPPORT: { tabLabelId: 'global.support', ariaLabelId: 'proposal.step.user.supports.infos.btn.supports' },
  SIGN: { tabLabelId: 'global.signatures', ariaLabelId: 'proposal.step.user.signatures.infos.btn.signatures' },
}

const FRAGMENT = graphql`
  fragment VoteStepMobileVotesModal_proposalStep on ProposalStep {
    ...VotesPopup_proposalStep
    ...VoteStepUserInfos_proposalStep
    voteType
    actionButtonLabel
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

const VoteStepMobileVotesModal: FC<Props> = ({ step: stepKey, isActive = false, onButtonClick, onClose }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const { tabLabelId, ariaLabelId } = VOTE_ACTION_LABEL_IDS[getVoteAction(step.actionButtonLabel)]

  return (
    <Modal
      show={isActive}
      onClose={onClose}
      disclosure={
        <Button
          id="change-to-votes-view"
          variant={isActive ? 'primary' : 'tertiary'}
          flexDirection="column"
          flex="1 0 0"
          onClick={() => onButtonClick?.()}
        >
          <Icon name={CapUIIcon.ThumbUpO} size={CapUIIconSize.Md} />
          <Box as="span" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S}>
            {intl.formatMessage({ id: tabLabelId })}
          </Box>
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: ariaLabelId })}
      size={CapUIModalSize.Fullscreen}
      fullSizeOnMobile
      hideCloseButton
      alwaysOpenInPortal
      forceModalDialogToFalse
      hideOnClickOutside={false}
      zIndex={999}
    >
      <Modal.Body pt="md" pb={pxToRem(72)} overflow="hidden">
        <VoteStepUserInfos step={step} />
        <Box mt="xs" overflow="auto">
          <VotesPopup step={step} />
        </Box>
      </Modal.Body>
    </Modal>
  )
}

export default VoteStepMobileVotesModal
