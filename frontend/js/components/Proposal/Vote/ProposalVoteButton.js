// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { openVoteModal } from '../../../redux/modules/proposal';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import type { Uuid, Dispatch, GlobalState } from '../../../types';
import type { ProposalVoteButton_proposal } from '~relay/ProposalVoteButton_proposal.graphql';
import FluxDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';
import RemoveProposalVoteMutation from '../../../mutations/RemoveProposalVoteMutation';
import {
  isInterpellationContextFromStep,
  isInterpellationContextFromProposal,
} from '~/utils/interpellationLabelHelper';

type Step = {|
  +id: Uuid,
|};

type ParentProps = {|
  proposal: ProposalVoteButton_proposal,
  step: Step,
  user: { +id: string },
  isHovering: boolean,
  id: string,
|};

type Props = {|
  ...ParentProps,
  proposal: ProposalVoteButton_proposal,
  dispatch: Dispatch,
  isDeleting: boolean,
  disabled: boolean,
  isAuthenticated: boolean,
|};

const deleteVote = (step: Step, proposal: ProposalVoteButton_proposal, isAuthenticated: boolean) =>
  RemoveProposalVoteMutation.commit({
    stepId: step.id,
    input: { proposalId: proposal.id, stepId: step.id },
    isAuthenticated,
  })
    .then(response => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content:
            response.removeProposalVote &&
            response.removeProposalVote.step &&
            isInterpellationContextFromStep(response.removeProposalVote.step)
              ? 'support.delete_success'
              : 'vote.delete_success',
        },
      });
    })
    .catch(e => {
      console.log(e); // eslint-disable-line no-console
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'global.failure',
        },
      });
    });

// Should only be used via ProposalVoteButtonWrapper
export class ProposalVoteButton extends React.Component<Props> {
  static defaultProps = { disabled: false, isHovering: false };

  target: null;

  getButtonStyle = () => {
    const { isHovering, proposal } = this.props;
    if (proposal.viewerVote && isHovering) {
      return 'btn btn-danger';
    }
    return 'btn btn-success';
  };

  getButtonText = () => {
    const { isHovering, proposal } = this.props;
    const isInterpellation = isInterpellationContextFromProposal(proposal);

    if (proposal.viewerHasVote) {
      if (isInterpellation) {
        return isHovering ? 'global.cancel' : 'interpellation.support.supported';
      }
      return isHovering ? 'global.cancel' : 'proposal.vote.voted';
    }

    if (isInterpellation) {
      return 'global.support.for';
    }

    return 'global.vote.for';
  };

  render() {
    const {
      dispatch,
      step,
      user,
      proposal,
      disabled,
      isDeleting,
      id,
      isAuthenticated,
    } = this.props;
    const classes = classNames({ disabled });
    const action = !user
      ? null
      : proposal.viewerHasVote
      ? () => {
          deleteVote(step, proposal, isAuthenticated);
        }
      : () => {
          dispatch(openVoteModal(proposal.id));
        };

    return (
      <Button
        id={id}
        ref={button => {
          this.target = button;
        }}
        className={`mr-10 proposal__button__vote ${this.getButtonStyle()} ${classes} `}
        onClick={disabled ? null : action}
        active={proposal.viewerHasVote}
        disabled={disabled || isDeleting}>
        {proposal.viewerVote && (
          <UnpublishedTooltip
            target={() => ReactDOM.findDOMNode(this.target)}
            publishable={proposal.viewerVote}
          />
        )}
        <FormattedMessage id={this.getButtonText()} />
      </Button>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => ({
  isDeleting: state.proposal.currentDeletingVote === props.proposal.id,
  isAuthenticated: !!state.user.user,
});

const container = connect(mapStateToProps)(ProposalVoteButton);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalVoteButton_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        stepId: { type: "ID!" }
      ) {
      id
      ...interpellationLabelHelper_proposal @relay(mask: false)
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
      viewerVote(step: $stepId) @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
});
