// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Link } from 'react-router-dom';
import type { DraftProposalPreview_proposal } from '~relay/DraftProposalPreview_proposal.graphql';
import { translateContent } from '~/utils/ContentTranslator';
import { getBaseUrlFromProposalUrl } from '~/utils/router';
import { getBaseUrl } from '~/config';

type Props = {
  proposal: DraftProposalPreview_proposal,
  stepUrl: string,
};

export class DraftProposalPreview extends React.Component<Props> {
  render() {
    const { proposal, stepUrl } = this.props;
    const url = getBaseUrlFromProposalUrl(proposal.url);

    return (
      <li className="list-group-item">
        <Link
          to={{
            pathname: `/${url}/${proposal.slug}`,
            state: {
              currentVotableStepId: proposal.currentVotableStep?.id,
              stepUrl: stepUrl.replace(getBaseUrl(), ''),
            },
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
