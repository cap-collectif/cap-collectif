// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import RemoveCommentVoteMutation from '../../mutations/RemoveCommentVoteMutation';
import AddCommentVoteMutation from '../../mutations/AddCommentVoteMutation';
import LoginOverlay from '../Utils/LoginOverlay';
import UnpublishedTooltip from '../Publishable/UnpublishedTooltip';
import type { CommentVoteButton_comment } from '~relay/CommentVoteButton_comment.graphql';

type Props = {|
  +comment: CommentVoteButton_comment,
|};

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
    const { comment } = this.props;
    if (comment.author && comment.author.isViewer) {
      return (
        <button type="button" disabled="disabled" className="btn btn-dark-gray btn-xs">
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
          type="button"
          ref={ref => {
            // $FlowFixMe
            this.target = ref;
          }}
          className="btn btn-danger btn-xs"
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
        <button type="button" className="btn btn-success btn--outline btn-xs" onClick={this.vote}>
          <i className="cap-hand-like-2" /> {<FormattedMessage id="comment.vote.submit" />}
        </button>
      </LoginOverlay>
    );
  };

  render() {
    const { comment } = this.props;
    return (
      <span>
        <form className="opinion__votes-button">{this.renderFormOrDisabled()} </form>
        <span className="opinion__votes-nb">{comment.votes.totalCount}</span>
      </span>
    );
  }
}

export default createFragmentContainer(CommentVoteButton, {
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
