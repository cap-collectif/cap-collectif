// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import { openVoteModal, deleteVote } from '../../../redux/modules/proposal';
import type { Uuid, Dispatch, GlobalState } from '../../../types';

type Step = {
  +id: Uuid,
};

type ParentProps = {
  proposal: { +id: string },
  step: Step,
  userHasVote: ?boolean,
  user: { +id: string },
  id: string,
};

type Props = ParentProps & {
  dispatch: Dispatch,
  isDeleting: boolean,
  disabled: boolean,
};

type State = {
  isHovering: boolean,
};

// Should only be used via ProposalVoteButtonWrapper
export class ProposalVoteButton extends React.Component<Props, State> {
  static defaultProps = {
    disabled: false,
    userHasVote: false,
  };
  state = {
    isHovering: false,
  };

  render() {
    const { dispatch, step, user, proposal, disabled, userHasVote, isDeleting, id } = this.props;
    const classes = classNames({ disabled });
    const action = !user
      ? null
      : userHasVote
        ? () => {
            deleteVote(step, proposal);
          }
        : () => {
            dispatch(openVoteModal(proposal.id));
          };
    let buttonText = '';
    let style = 'btn btn-success';
    if (userHasVote && this.state.isHovering) {
      buttonText = 'proposal.vote.delete';
      style = 'btn btn-danger';
    }

    if (userHasVote && !this.state.isHovering) {
      buttonText = 'proposal.vote.hasVoted';
      style = 'btn btn-success';
    }

    if (!userHasVote) {
      buttonText = 'proposal.vote.add';
      style = 'btn btn-success';
    }

    return (
      <Button
        id={id}
        className={`mr-15 proposal__button__vote ${style} ${classes} `}
        onMouseOver={() => {
          if (userHasVote) {
            this.setState({
              isHovering: true,
            });
          }
        }}
        onMouseOut={() => {
          if (userHasVote) {
            this.setState({
              isHovering: false,
            });
          }
        }}
        onClick={disabled ? null : action}
        active={userHasVote}
        disabled={disabled || isDeleting}>
        <FormattedMessage id={buttonText} />
      </Button>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: ParentProps) => ({
  isDeleting: state.proposal.currentDeletingVote === props.proposal.id,
});

export default connect(mapStateToProps)(ProposalVoteButton);
