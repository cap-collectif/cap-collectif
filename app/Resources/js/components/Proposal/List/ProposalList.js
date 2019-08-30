// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import ProposalPreview from '../Preview/ProposalPreview';
import ProposalListTable from './ProposalListTable';
import VisibilityBox from '../../Utils/VisibilityBox';
import type { ProposalList_step } from '~relay/ProposalList_step.graphql';
import type { ProposalList_viewer } from '~relay/ProposalList_viewer.graphql';
import type { ProposalList_proposals } from '~relay/ProposalList_proposals.graphql';
import type { ProposalViewMode } from '../../../redux/modules/proposal';

type Props = {
  step: ?ProposalList_step,
  proposals: ProposalList_proposals,
  viewer: ?ProposalList_viewer,
  view?: ProposalViewMode,
};

const classes = classNames({
  'media-list': true,
  'proposal-preview-list': true,
  opinion__list: true,
});

const renderProposals = (proposals, step, viewer) => (
  <Row>
    <ul className={classes}>
      {proposals.edges &&
        proposals.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map((node, key) => (
            <ProposalPreview key={key} proposal={node} step={step} viewer={viewer} />
          ))}
    </ul>
  </Row>
);

const renderProposalListTableView = (proposals, step) => (
  // $FlowFixMe
  <ProposalListTable step={step} proposals={proposals} />
);

export class ProposalList extends React.Component<Props> {
  render() {
    const { step, proposals, viewer, view } = this.props;

    if (proposals.totalCount === 0) {
      return (
        <p className={classNames({ 'p--centered': true })} style={{ marginBottom: '40px' }}>
          <FormattedMessage id="proposal.empty" />
        </p>
      );
    }

    const proposalsVisibleOnlyByViewer = { edges: [] };
    const proposalsVisiblePublicly = proposals;

    return (
      <React.Fragment>
        {proposalsVisiblePublicly.edges && proposalsVisiblePublicly.edges.length > 0 && (
          <React.Fragment>
            {view === 'mosaic'
              ? renderProposals(proposalsVisiblePublicly, step, viewer)
              : renderProposalListTableView(proposalsVisiblePublicly, step)}
          </React.Fragment>
        )}
        {proposalsVisibleOnlyByViewer.edges && proposalsVisibleOnlyByViewer.edges.length > 0 && (
          <VisibilityBox enabled>
            {view === 'mosaic'
              ? renderProposals(proposalsVisibleOnlyByViewer, step, viewer)
              : renderProposalListTableView(proposalsVisibleOnlyByViewer, step)}
          </VisibilityBox>
        )}
      </React.Fragment>
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
      ...ProposalListTable_step
      ...ProposalPreview_step
      ...ProposalsDisplayMap_step
    }
  `,
  proposals: graphql`
    fragment ProposalList_proposals on ProposalConnection {
      ...ProposalListTable_proposals @arguments(stepId: $stepId)
      totalCount
      edges {
        node {
          id
          ...ProposalPreview_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
        }
      }
    }
  `,
});
