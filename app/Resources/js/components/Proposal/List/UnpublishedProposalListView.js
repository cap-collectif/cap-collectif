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
    if (
      !step.viewerProposalsUnpublished ||
      step.viewerProposalsUnpublished.totalCount === 0 ||
      !step.viewerProposalsUnpublished.edges ||
      !step.viewerProposalsUnpublished.edges[0]
    ) {
      return null;
    }
    const { notPublishedReason } = step.viewerProposalsUnpublished.edges[0].node;
    return (
      <Panel bsStyle="danger">
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            <strong>
              <FormattedMessage
                id="count-proposal"
                values={{ num: step.viewerProposalsUnpublished.totalCount }}
              />
            </strong>{' '}
            <FormattedMessage
              id={
                notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION'
                  ? 'awaiting-publication-lowercase'
                  : 'unpublished-lowercase'
              }
              values={{ num: step.viewerProposalsUnpublished.totalCount }}
            />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {/* $FlowFixMe */}
          <ProposalList
            step={step}
            proposals={step.viewerProposalsUnpublished}
            viewer={viewer}
            view="mosaic"
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
    fragment UnpublishedProposalListView_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...ProposalList_step
      viewerProposalsUnpublished(first: 100)
        @include(if: $isAuthenticated)
        @connection(key: "UnpublishedProposalListView_viewerProposalsUnpublished", filters: []) {
        totalCount
        ...ProposalList_proposals
        edges {
          node {
            id
            notPublishedReason
          }
        }
      }
    }
  `,
});
