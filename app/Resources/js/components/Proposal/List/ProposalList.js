// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import ProposalPreview from '../Preview/ProposalPreview';
import VisibilityBox from '../../Utils/VisibilityBox';
import type { ProposalList_step } from './__generated__/ProposalList_step.graphql';

type Props = {
  step: ProposalList_step,
};

const renderProposals = (proposals, step) => (
  <div>
    {proposals.edges.map((edge, key) => (
      <ProposalPreview
        key={key}
        proposal={edge.node}
        step={step}
        // showThemes={showThemes}
        // showComments={showComments}
      />
    ))}
  </div>
)

export class ProposalList extends React.Component<Props> {

  render() {
    const { step } = this.props;
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

    const proposalsVisibleOnlyByViewer = [];
    const proposalsVisiblePublicly = proposals;

    return (
      <Row>
        {proposalsVisiblePublicly.edges.length && (
          <ul className={classes}>
            {renderProposals(proposalsVisiblePublicly, step)}
          </ul>
        )}
        {proposalsVisibleOnlyByViewer.edges.length && (
          <VisibilityBox enabled>
            <ul className={classes}>
              {renderProposals(proposalsVisibleOnlyByViewer, step)}
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
    step: graphql`
      fragment ProposalList_step on Step {
        id
        ... on CollectStep {
          form {
            proposals {
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
        }
        ... on SelectionStep {
          proposals {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `,
  }
);
