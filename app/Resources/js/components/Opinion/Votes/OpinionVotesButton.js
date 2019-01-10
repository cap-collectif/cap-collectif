// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import FluxDispatcher from '../../../dispatchers/AppDispatcher';
import { VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import AddOpinionVoteMutation from '../../../mutations/AddOpinionVoteMutation';
import RemoveOpinionVoteMutation from '../../../mutations/RemoveOpinionVoteMutation';
import RequirementsFormModal from '../../Requirements/RequirementsModal';
import type { OpinionVotesButton_opinion } from './__generated__/OpinionVotesButton_opinion.graphql';

type RelayProps = {
  opinion: OpinionVotesButton_opinion,
};

type YesNoPairedVoteValue = 'MITIGE' | 'NO' | 'YES';

const valueToObject = (value: YesNoPairedVoteValue): Object => {
  if (value === 'NO') {
    return {
      style: 'danger',
      str: 'nok',
      icon: 'cap cap-hand-unlike-2-1',
    };
  }
  if (value === 'MITIGE') {
    return {
      style: 'warning',
      str: 'mitige',
      icon: 'cap cap-hand-like-2 icon-rotate',
    };
  }
  return {
    style: 'success',
    str: 'ok',
    icon: 'cap cap-hand-like-2-1',
  };
};

type Props = {
  style: Object,
  value: YesNoPairedVoteValue,
} & RelayProps;

type State = {
  isLoading: boolean,
  openModal: boolean,
};

export class OpinionVotesButton extends React.Component<Props, State> {
  static defaultProps = { style: {} };

  state = { isLoading: false, openModal: false };

  target = null;

  vote = () => {
    const { opinion, value } = this.props;
    if (opinion.__typename === 'Version' || opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id, value };
      this.setState({ isLoading: true });
      AddOpinionVoteMutation.commit({ input })
        .then(res => {
          if (!res.addOpinionVote) {
            throw new Error('mutation failed');
          }
          FluxDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: {
              bsStyle: 'success',
              content: 'opinion.request.create_vote.success',
            },
          });
          this.setState({ isLoading: false });
        })
        .catch(() => {
          FluxDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: {
              bsStyle: 'danger',
              content: 'opinion.request.failure',
            },
          });
          this.setState({ isLoading: false });
        });
    }
  };

  deleteVote = () => {
    const { opinion } = this.props;
    if (opinion.__typename === 'Version' || opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id };
      this.setState({ isLoading: true });
      RemoveOpinionVoteMutation.commit({ input })
        .then(res => {
          if (!res.removeOpinionVote) {
            throw new Error('mutation failed');
          }
          FluxDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: {
              bsStyle: 'success',
              content: 'opinion.request.delete_vote.success',
            },
          });
          this.setState({ isLoading: false });
        })
        .catch(() => {
          FluxDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: {
              bsStyle: 'danger',
              content: 'opinion.request.failure',
            },
          });
          this.setState({ isLoading: false });
        });
    }
  };

  voteAction = () => {
    const { opinion, value } = this.props;
    if (
      opinion.step &&
      opinion.step.requirements &&
      !opinion.step.requirements.viewerMeetsTheRequirements
    ) {
      this.openModal();
      return false;
    }
    const active = opinion.viewerVote && opinion.viewerVote.value === value;
    return active ? this.deleteVote() : this.vote();
  };

  voteIsEnabled = () => {
    const { opinion } = this.props;
    if (!opinion.section) {
      return false;
    }
    const voteType = opinion.section.voteWidgetType;
    if (voteType === VOTE_WIDGET_BOTH) {
      return true;
    }
    return false;
  };

  voteIsEnabled = () => {
    const { opinion } = this.props;
    if (!opinion.section) {
      return false;
    }
    const voteType = opinion.section.voteWidgetType;
    if (voteType === VOTE_WIDGET_BOTH) {
      return true;
    }
    return false;
  };

  openModal = () => {
    this.setState({ openModal: true });
  };

  closeModal = () => {
    this.setState({ openModal: false });
  };

  render() {
    const { opinion, value, style } = this.props;
    const { isLoading, openModal } = this.state;
    if (
      !this.voteIsEnabled() ||
      (opinion.__typename !== 'Opinion' && opinion.__typename !== 'Version')
    ) {
      return null;
    }
    const disabled = !opinion.contribuable;
    const data = valueToObject(value);
    const active = opinion.viewerVote && opinion.viewerVote.value === value;
    return (
      <div>
        {opinion.step /* $FlowFixMe */ && (
          <RequirementsFormModal
            step={opinion.step}
            reason={opinion.step.requirements.reason}
            handleClose={this.closeModal}
            show={openModal}
          />
        )}
        <LoginOverlay>
          <Button
            ref={button => {
              this.target = button;
            }}
            style={style}
            bsStyle={data.style}
            className="btn--outline"
            onClick={this.voteAction}
            active={active}
            aria-label={
              <FormattedMessage
                id={active ? `vote.aria_label_active.${data.str}` : `vote.aria_label.${data.str}`}
              />
            }
            disabled={disabled || isLoading}>
            {active /* $FlowFixMe */ && (
              <UnpublishedTooltip
                target={() => ReactDOM.findDOMNode(this.target)}
                publishable={opinion.viewerVote}
              />
            )}
            <i className={data.icon} /> <FormattedMessage id={`vote.${data.str}`} />
          </Button>
        </LoginOverlay>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionVotesButton, {
  opinion: graphql`
    fragment OpinionVotesButton_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      __typename
      ... on Opinion {
        id
        contribuable
        step {
          id
          ...RequirementsForm_step
          requirements {
            reason
            viewerMeetsTheRequirements
          }
        }
        section {
          voteWidgetType
        }
        viewerVote @include(if: $isAuthenticated) {
          id
          value
          ...UnpublishedTooltip_publishable
        }
      }
      ... on Version {
        id
        contribuable
        step {
          id
          ...RequirementsForm_step
          requirements {
            reason
            viewerMeetsTheRequirements
          }
        }
        section {
          voteWidgetType
        }
        viewerVote @include(if: $isAuthenticated) {
          id
          value
          ...UnpublishedTooltip_publishable
        }
        parent {
          id
        }
      }
    }
  `,
});
