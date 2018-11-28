// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DraftProposalPreview_proposal } from './__generated__/DraftProposalPreview_proposal.graphql';

type Props = {
  proposal: DraftProposalPreview_proposal,
};

export class DraftProposalPreview extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    return (
      <li className="list-group-item">
        <a href={proposal.show_url}>{proposal.title}</a>
      </li>
    );
  }
}

export default createFragmentContainer(
  DraftProposalPreview,
  graphql`
    fragment DraftProposalPreview_proposal on Proposal {
      title
      show_url
    }
  `,
);
