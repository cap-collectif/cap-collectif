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

type Props = {
  step: ProposalList_step,
  viewer: ProposalList_viewer,
};

const renderProposals = (proposals, step, viewer) => (
  <div>
    {proposals.edges && proposals.edges.filter(Boolean).map(edge => edge.node).filter(Boolean).map((node, key) => (
      // $FlowFixMe
      <ProposalPreview
        key={key}
        // $FlowFixMe
        proposal={node}
        step={step}
        viewer={viewer}
      />
    ))}
  </div>
)

export class ProposalList extends React.Component<Props> {

  render() {
    const { step, viewer } = this.props;
    // $FlowFixMe
    const proposals = step.proposals || step.form.proposals;

    if (proposals.totalCount === 0) {
      return (
        <p className={classNames({ 'p--centered': true })} style={{ marginBottom: '40px' }}>
          <FormattedMessage id="proposal.private.empty" />
        </p>
      );
    }

    const classes = classNames({
      'media-list': true,
      'proposal-preview-list': true,
      opinion__list: true,
    });

    const proposalsVisibleOnlyByViewer = { edges: [] };
    const proposalsVisiblePublicly = proposals;

    return (
      <Row>
        {proposalsVisiblePublicly.edges && proposalsVisiblePublicly.edges.length && (
          <ul className={classes}>
            {renderProposals(proposalsVisiblePublicly, step, viewer)}
          </ul>
        )}
        {proposalsVisibleOnlyByViewer.edges && proposalsVisibleOnlyByViewer.edges.length && (
          <VisibilityBox enabled>
            <ul className={classes}>
              {renderProposals(proposalsVisibleOnlyByViewer, step, viewer)}
            </ul>
          </VisibilityBox>
        )}
      </Row>
    );
  }
};

export default createFragmentContainer(
  ProposalList,
  {
    viewer: graphql`
      fragment ProposalList_viewer on User {
        ...ProposalPreview_viewer
      }
    `,
    step: graphql`
      fragment ProposalList_step on Step {
        id
        ...ProposalPreview_step
        ... on CollectStep {
          form {
            proposals(first: $count, orderBy: $orderBy, term: $term, district: $district, theme: $theme, status: $status, userType: $userType) {
              totalCount
              edges {
                node {
                  id
                  ...ProposalPreview_proposal
                }
              }
            }
          }
        }
        ... on SelectionStep {
          proposals(first: $count, orderBy: $orderBy, term: $term, district: $district, theme: $theme, status: $status, userType: $userType) {
            totalCount
            edges {
              node {
                id
                ...ProposalPreview_proposal
              }
            }
          }
        }
      }
    `,
  }
);
