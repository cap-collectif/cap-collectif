// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import RemoveCommentVoteMutation from '../../mutations/RemoveCommentVoteMutation';
import AddCommentVoteMutation from '../../mutations/AddCommentVoteMutation';
import LoginOverlay from '../Utils/LoginOverlay';
import UnpublishedTooltip from '../Publishable/UnpublishedTooltip';
import type { CommentVoteButton_comment } from './__generated__/CommentVoteButton_comment.graphql';
import type { GlobalState } from '../../types';

type Props = {
  comment: CommentVoteButton_comment,
  viewer: Object,
};

class CommentVoteButton extends React.Component<Props> {
  target: null;

  deleteVote = () => {
    const { comment } = this.props;
    RemoveCommentVoteMutation.commit(
      { input: { commentId: comment.id } },
      { votesCount: comment.votes.totalCount },
    );
  };

  vote = () => {
    const { comment } = this.props;
    AddCommentVoteMutation.commit(
      { input: { commentId: comment.id } },
      { votesCount: comment.votes.totalCount },
    );
  };

  renderFormOrDisabled = () => {
    const { viewer } = this.props;
    if (!viewer || !viewer.isEmailConfirmed) {
      return (
        <button disabled="disabled" className="btn btn-dark-gray btn-sm">
          <i className="cap-hand-like-2" /> {<FormattedMessage id="comment.vote.submit" />}
        </button>
      );
    }

    return this.renderVoteButton();
  };

  renderVoteButton = () => {
    const { comment } = this.props;

    if (comment.viewerHasVote) {
      return (
        <button
          ref={ref => {
            // $FlowFixMe
            this.target = ref;
          }}
          className="btn btn-danger btn-sm"
          onClick={this.deleteVote}>
          {/* $FlowFixMe */}
          <UnpublishedTooltip
            target={() => ReactDOM.findDOMNode(this.target)}
            publishable={comment.viewerVote}
          />
          <FormattedMessage id="comment.vote.remove" />
        </button>
      );
    }

    return (
      <LoginOverlay>
        <button className="btn btn-success btn--outline btn-sm" onClick={this.vote}>
          <i className="cap-hand-like-2" /> {<FormattedMessage id="comment.vote.submit" />}
        </button>
      </LoginOverlay>
    );
  };

  render() {
    const { comment } = this.props;
    return (
      <span className="comment__agree">
        {this.renderFormOrDisabled()}{' '}
        <span className="opinion__votes-nb">{comment.votes.totalCount}</span>
      </span>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  viewer: state.user.user,
});

const container = connect(mapStateToProps)(CommentVoteButton);

export default createFragmentContainer(container, {
  comment: graphql`
    fragment CommentVoteButton_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      author {
        isViewer @include(if: $isAuthenticated)
      }
      votes(first: 0) {
        totalCount
      }
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
});
