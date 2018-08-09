// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { UnpublishedProposalListView_step } from './__generated__/UnpublishedProposalListView_step.graphql';
import type { UnpublishedProposalListView_viewer } from './__generated__/UnpublishedProposalListView_viewer.graphql';
import ProposalList from './ProposalList';

type Props = {
  step: UnpublishedProposalListView_step,
  viewer: UnpublishedProposalListView_viewer,
};

export class UnpublishedProposalListView extends React.Component<Props> {
  render() {
    const { step, viewer } = this.props;
    if (step.viewerUnpublishedProposals.totalCount === 0) {
      return null;
    }
    return (
      <Panel bsStyle="danger">
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            <strong>
              <FormattedMessage
                id="count-proposal"
                values={{ num: step.viewerUnpublishedProposals.totalCount }}
              />
            </strong>{' '}
            <FormattedMessage id="awaiting-publication-lowercase" />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {/* $FlowFixMe */}
          <ProposalList
            step={step}
            proposals={step.viewerUnpublishedProposals}
            viewer={viewer}
            id="proposals-unpublished-list"
          />
        </Panel.Body>
      </Panel>
    );
  }
}

export default createFragmentContainer(UnpublishedProposalListView, {
  viewer: graphql`
    fragment UnpublishedProposalListView_viewer on User {
      ...ProposalList_viewer
    }
  `,
  step: graphql`
    fragment UnpublishedProposalListView_step on ProposalStep {
      id
      ...ProposalList_step
      viewerUnpublishedProposals: proposals(includeUnpublishedOnly: true, first: 100)
        @connection(key: "UnpublishedProposalListView_viewerUnpublishedProposals", filters: []) {
        totalCount
        ...ProposalList_proposals
        edges {
          node {
            id
          }
        }
      }
    }
  `,
});
