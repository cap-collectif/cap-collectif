// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classNames from 'classnames';
import { Box } from '@cap-collectif/ui';
import DraftProposalPreview from '../Preview/DraftProposalPreview';
import DraftBox from '../../Utils/DraftBox';
import type { DraftProposalList_step } from '~relay/DraftProposalList_step.graphql';

type Props = {
  step: DraftProposalList_step,
};

export class DraftProposalList extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const classes = classNames({
      'list-group': true,
      'mb-40': true,
    });

    if (!step.viewerProposalDrafts || !step.viewerProposalDrafts.edges) {
      return null;
    }

    const proposals = step.viewerProposalDrafts.edges.filter(Boolean);
    if (proposals.length === 0) {
      return null;
    }

    return (
      <Box id="draftAnchor" pt={8}>
        <DraftBox>
          <ul className={classes}>
            {proposals.map((edge, i) => (
              <DraftProposalPreview key={`draft-proposal-${i}`} proposal={edge.node} />
            ))}
          </ul>
        </DraftBox>
      </Box>
    );
  }
}

export default createFragmentContainer(DraftProposalList, {
  step: graphql`
    fragment DraftProposalList_step on CollectStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      viewerProposalDrafts @include(if: $isAuthenticated) {
        edges {
          node {
            ...DraftProposalPreview_proposal
          }
        }
      }
    }
  `,
});
