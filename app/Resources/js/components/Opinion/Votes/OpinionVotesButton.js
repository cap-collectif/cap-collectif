// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';
import { VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import type { VoteValue, State, Dispatch } from '../../../types';
import type { OpinionVotesButton_opinion } from './__generated__/OpinionVotesButton_opinion.graphql';

type RelayProps = {
  opinion: OpinionVotesButton_opinion,
};
const valueToObject = (value: VoteValue): Object => {
  if (value === -1) {
    return {
      style: 'danger',
      str: 'nok',
      icon: 'cap cap-hand-unlike-2-1',
    };
  }
  if (value === 0) {
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
  style?: Object,
  value: VoteValue,
  active: boolean,
  disabled?: boolean,
  dispatch: Dispatch,
  user?: Object,
  features: Object,
} & RelayProps;

export class OpinionVotesButton extends React.Component<Props> {
  static defaultProps = {
    style: {},
    disabled: false,
  };

  vote = () => {
    const { opinion, value, dispatch } = this.props;
    // if (opinion.__typename === 'Version') {
    //   //voteVersion(value, opinion.id, opinion.parent.id, dispatch);
    // }
    // if (opinion.__typename === 'Opinion') {
    //   //voteOpinion(value, opinion.id, dispatch);
    // }
  };

  deleteVote = () => {
    const { opinion, dispatch } = this.props;
    // if (opinion.__typename === 'Version') {
    //   //deleteVoteVersion(opinion.id, opinion.parent.id, dispatch);
    // }
    // if (opinion.__typename === 'Opinion') {
    //   //deleteVoteOpinion(opinion.id, dispatch);
    // }
  };

  voteAction = () => {
    const { disabled, user, active } = this.props;
    if (!user || disabled) {
      return null;
    }
    return active ? this.deleteVote() : this.vote();
  };

  voteIsEnabled = () => {
    const { opinion, value } = this.props;
    if (!opinion.section) {
      return false;
    }
    const voteType = opinion.section.voteWidgetType;
    if (voteType === VOTE_WIDGET_BOTH) {
      return true;
    }
    if (voteType === VOTE_WIDGET_SIMPLE) {
      return value === 1;
    }
    return false;
  };

  render() {
    if (!this.voteIsEnabled()) {
      return null;
    }
    const { disabled, style, value, active } = this.props;
    const data = valueToObject(value);
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

const mapStateToProps: MapStateToProps<*, *, *> = (
  state: State,
  { opinion, value }: { value: VoteValue } & RelayProps,
) => {
  const vote =
    opinion.__typename === 'Opinion' || opinion.__typename === 'Version'
      ? opinion.viewerVote
      : null;
  return {
    features: state.default.features,
    user: state.user.user,
    active: vote && vote.value === value,
  };
};

const container = connect(mapStateToProps)(OpinionVotesButton);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionVotesButton_opinion on OpinionOrVersion {
      __typename
      ... on Opinion {
        id
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
