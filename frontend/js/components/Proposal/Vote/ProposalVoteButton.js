// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import type { IntlShape } from 'react-intl';
import { openVoteModal } from '~/redux/modules/proposal';
import type {
  ProposalVoteButton_proposal$key,
  ProposalVoteButton_proposal,
} from '~relay/ProposalVoteButton_proposal.graphql';
import RemoveProposalVoteMutation from '../../../mutations/RemoveProposalVoteMutation';
import {
  isInterpellationContextFromStep,
  isInterpellationContextFromProposal,
} from '~/utils/interpellationLabelHelper';
import { toast } from '~ds/Toast';
import type {
  ProposalVoteButton_step$key,
  ProposalVoteButton_step,
} from '~relay/ProposalVoteButton_step.graphql';
// TODO @Mo remake this file with @cap-collectif/ui to replace tooltip that already doesn't work
type ParentProps = {|
  proposal: ProposalVoteButton_proposal$key,
  currentStep: ?ProposalVoteButton_step$key,
  user: { +id: string },
  isHovering?: boolean,
  id: string,
  className?: string,
|};

type Props = {|
  ...ParentProps,
  disabled: boolean,
|};

const deleteVote = (
  currentStep: ProposalVoteButton_step,
  proposal: ProposalVoteButton_proposal,
  isAuthenticated: boolean,
  intl: IntlShape,
) => {
  return RemoveProposalVoteMutation.commit({
    stepId: currentStep.id,
    input: { proposalId: proposal.id, stepId: currentStep.id },
    isAuthenticated,
  })
    .then(response => {
      toast({
        variant: 'success',
        content:
          response.removeProposalVote &&
          response.removeProposalVote.step &&
          isInterpellationContextFromStep(response.removeProposalVote.step)
            ? intl.formatMessage({ id: 'support.delete_success' })
            : intl.formatMessage({ id: 'vote.delete_success' }),
      });
    })
    .catch(() => {
      toast({
        variant: 'warning',
        content: intl.formatMessage({ id: 'global.failure' }),
      });
    });
};

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButton_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    ...interpellationLabelHelper_proposal @relay(mask: false)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    viewerVote(step: $stepId) @include(if: $isAuthenticated) {
      id
      ranking
      ...UnpublishedTooltip_publishable
    }
  }
`;
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButton_step on ProposalStep {
    id
    votesRanking
  }
`;

const ProposalVoteButton = ({
  currentStep: stepRef,
  user,
  isHovering = false,
  id,
  proposal: proposalRef,
  disabled = false,
}: Props) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef);
  const currentStep = useFragment(STEP_FRAGMENT, stepRef);
  const isAuthenticated = useSelector(state => state.user.user) != null;
  const isDeleting = useSelector(state => state.proposal.currentDeletingVote) === proposal.id;
  const dispatch = useDispatch();
  const getButtonStyle = () => {
    if (proposal.viewerVote && isHovering) {
      return 'btn btn-danger';
    }
    return 'btn btn-success';
  };
  const intl = useIntl();

  const getButtonText = () => {
    const isInterpellation = isInterpellationContextFromProposal(proposal);

    if (proposal.viewerHasVote) {
      if (isInterpellation) {
        return isHovering ? 'cancel' : 'interpellation.support.supported';
      }
      return isHovering ? 'cancel' : 'voted';
    }

    if (isInterpellation) {
      return 'global.support.for';
    }

    return 'global.vote.for';
  };
  const classes = classNames({ disabled });
  const onButtonClick =
    !user || disabled
      ? null
      : proposal.viewerHasVote
      ? () => {
          if (currentStep) {
            deleteVote(currentStep, proposal, isAuthenticated, intl);
          }
        }
      : () => {
          dispatch(openVoteModal(proposal.id));
        };
  return (
    <Button
      id={id}
      className={`mr-10 proposal__button__vote ${getButtonStyle()} ${classes} `}
      onClick={onButtonClick}
      active={proposal.viewerHasVote}
      disabled={disabled || isDeleting}>
      <i className="cap cap-hand-like-2 mr-5" />
      {intl.formatMessage({ id: getButtonText() })}
    </Button>
  );
};
export default ProposalVoteButton;
