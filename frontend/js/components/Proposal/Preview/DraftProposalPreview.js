// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Link } from 'react-router-dom';
import type { DraftProposalPreview_proposal } from '~relay/DraftProposalPreview_proposal.graphql';
import { translateContent } from '~/utils/ContentTranslator';

type Props = {
  proposal: DraftProposalPreview_proposal,
};

export class DraftProposalPreview extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    return (
      <li className="list-group-item">
        <Link
          to={{
            pathname: `/proposals/${proposal.slug}`,
            state: { currentVotableStepId: proposal.currentVotableStep?.id },
          }}>
          {translateContent(proposal.title)}
        </Link>
      </li>
    );
  }
}

export default createFragmentContainer(DraftProposalPreview, {
  proposal: graphql`
    fragment DraftProposalPreview_proposal on Proposal {
      title
      url
      slug
      currentVotableStep {
        id
      }
    }
  `,
});
