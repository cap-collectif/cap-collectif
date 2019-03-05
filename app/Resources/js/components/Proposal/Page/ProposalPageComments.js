// @flow
import * as React from 'react';
import classNames from 'classnames';
import { createFragmentContainer, graphql } from 'react-relay';
import CommentSection from '../../Comment/CommentSection';
import type { ProposalPageComments_proposal } from './__generated__/ProposalPageComments_proposal.graphql';

type Props = {
  proposal: ProposalPageComments_proposal,
  className: string,
};

class ProposalPageComments extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className, proposal } = this.props;
    const classes = {
      proposal__comments: true,
      [className]: true,
    };

    return (
      <div className={classNames(classes)}>
        {proposal.form.commentable && (
          // $FlowFixMe
          <CommentSection commentableId={proposal.id} />
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProposalPageComments, {
  proposal: graphql`
    fragment ProposalPageComments_proposal on Proposal {
      id
      form {
        id
        commentable
      }
    }
  `,
});
