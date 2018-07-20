// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';
import { VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import AddOpinionVoteMutation from '../../../mutations/AddOpinionVoteMutation';
import RemoveOpinionVoteMutation from '../../../mutations/RemoveOpinionVoteMutation';
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
  user?: Object,
} & RelayProps;

export class OpinionVotesButton extends React.Component<Props> {
  static defaultProps = {
    style: {},
  };

  vote = () => {
    const { opinion, value } = this.props;
    if (opinion.__typename === 'Version' || opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id, value };
      AddOpinionVoteMutation.commit({ input })
        .then(() => {
          //  FluxDispatcher.dispatch({
          //    actionType: UPDATE_OPINION_SUCCESS,
          //    message: 'opinion.request.delete_vote.success',
          //  });
        })
        .catch(() => {
          //    FluxDispatcher.dispatch({
          //      actionType: UPDATE_OPINION_FAILURE,
          //      message: 'opinion.request.failure',
          //    });
        });
    }
  };

  deleteVote = () => {
    const { opinion } = this.props;
    if (opinion.__typename === 'Version' || opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id };
      RemoveOpinionVoteMutation.commit({ input })
        .then(() => {
          // FluxDispatcher.dispatch({
          //   actionType: UPDATE_OPINION_SUCCESS,
          //           message: 'opinion.request.create_vote.success',
          // });
        })
        .catch(e => {
          // FluxDispatcher.dispatch({
          //   actionType: UPDATE_OPINION_FAILURE,
          //   message: 'opinion.request.failure',
          // });
          console.error(e); // eslint-disable-line no-console
        });
    }
  };

  voteAction = () => {
    const { opinion, value } = this.props;
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

  render() {
    const { opinion, value, style } = this.props;
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
      <LoginOverlay>
        <Button
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
          disabled={disabled}>
          <i className={data.icon} /> <FormattedMessage id={`vote.${data.str}`} />
        </Button>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(OpinionVotesButton, {
  opinion: graphql`
    fragment OpinionVotesButton_opinion on OpinionOrVersion {
      __typename
      ... on Opinion {
        id
        contribuable
        section {
          voteWidgetType
        }
        viewerVote {
          id
          value
        }
      }
      ... on Version {
        id
        contribuable
        section {
          voteWidgetType
        }
        viewerVote {
          id
          value
        }
        parent {
          id
        }
      }
    }
  `,
});
