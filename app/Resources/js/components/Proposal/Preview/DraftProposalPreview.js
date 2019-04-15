// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DraftProposalPreview_proposal } from '~relay/DraftProposalPreview_proposal.graphql';

type Props = {
  proposal: DraftProposalPreview_proposal,
};

export class DraftProposalPreview extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    return (
      <li className="list-group-item">
        <a href={proposal.url}>{proposal.title}</a>
      </li>
    );
  }
}

export default createFragmentContainer(DraftProposalPreview, {
  proposal: graphql`
    fragment DraftProposalPreview_proposal on Proposal {
      title
      url
    }
  `,
});
