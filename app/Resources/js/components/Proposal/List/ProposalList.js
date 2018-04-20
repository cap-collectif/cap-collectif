// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import ProposalPreview from '../Preview/ProposalPreview';
import VisibilityBox from '../../Utils/VisibilityBox';
import type { ProposalList_step } from './__generated__/ProposalList_step.graphql';
import type { ProposalList_viewer } from './__generated__/ProposalList_viewer.graphql';
import type { ProposalList_proposals } from './__generated__/ProposalList_proposals.graphql';

type Props = {
  step: ProposalList_step,
  proposals: ProposalList_proposals,
  viewer: ?ProposalList_viewer,
};

const classes = classNames({
  'media-list': true,
  'proposal-preview-list': true,
  opinion__list: true,
});

const renderProposals = (proposals, step, viewer) => (
  <ul className={classes}>
    {proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map((node, key) => (
          // $FlowFixMe
          <ProposalPreview
            key={key}
            // $FlowFixMe
            proposal={node}
            step={step}
            viewer={viewer}
          />
        ))}
  </ul>
);

export class ProposalList extends React.Component<Props> {
  render() {
    const { step, proposals, viewer } = this.props;

    if (proposals.totalCount === 0) {
      return (
        <p className={classNames({ 'p--centered': true })} style={{ marginBottom: '40px' }}>
          <FormattedMessage id="proposal.private.empty" />
        </p>
      );
    }

    const proposalsVisibleOnlyByViewer = { edges: [] };
    const proposalsVisiblePublicly = proposals;

    return (
      <Row>
        {proposalsVisiblePublicly.edges &&
          proposalsVisiblePublicly.edges.length &&
          renderProposals(proposalsVisiblePublicly, step, viewer)}
        {proposalsVisibleOnlyByViewer.edges &&
          proposalsVisibleOnlyByViewer.edges.length && (
            <VisibilityBox enabled>
              {renderProposals(proposalsVisibleOnlyByViewer, step, viewer)}
            </VisibilityBox>
          )}
      </Row>
    );
  }
}

export default createFragmentContainer(ProposalList, {
  viewer: graphql`
    fragment ProposalList_viewer on User {
      ...ProposalPreview_viewer
    }
  `,
  step: graphql`
    fragment ProposalList_step on ProposalStep {
      id
      ...ProposalPreview_step
    }
  `,
  proposals: graphql`
    fragment ProposalList_proposals on ProposalConnection {
      totalCount
      edges {
        node {
          id
          ...ProposalPreview_proposal
        }
      }
    }
  `,
});
