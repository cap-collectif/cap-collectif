// @flow
import * as React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import CommentSectionFragmented from '../../Comment/CommentSectionFragmented';
import type { ProposalPageComments_proposal } from '~relay/ProposalPageComments_proposal.graphql';
import type { GlobalState } from '../../../types';

type Props = {
  proposal: ProposalPageComments_proposal,
  className: string,
  isAuthenticated: boolean,
  unstable__enableCapcoUiDs?: boolean,
};

class ProposalPageComments extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className, proposal, isAuthenticated, unstable__enableCapcoUiDs } = this.props;
    if (!proposal) return null;
    const classes = {
      proposal__comments: !unstable__enableCapcoUiDs,
      [className]: true,
    };

    return (
      <div className={classNames(classes)}>
        {proposal.form.commentable && (
          <CommentSectionFragmented
            isAuthenticated={isAuthenticated}
            commentable={proposal}
            useBodyColor
            unstable__enableCapcoUiDs={unstable__enableCapcoUiDs}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageComments);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalPageComments_proposal on Proposal {
      id
      form {
        id
        commentable
      }
      ...CommentSectionFragmented_commentable @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
