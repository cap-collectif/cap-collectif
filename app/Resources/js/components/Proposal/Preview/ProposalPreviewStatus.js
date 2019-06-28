// @flow
import * as React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import Card from '../../Ui/Card/Card';
import type { ProposalPreviewStatus_proposal } from '~relay/ProposalPreviewStatus_proposal.graphql';
import colors from '../../../utils/colors';

type Props = {|
  +proposal: ProposalPreviewStatus_proposal,
|};

const TrashedReasonContainer = styled.div`
  padding: 5px;
  background-color: ${colors.pageBgc};
  border-top: 1px solid ${colors.borderColor};
`;

export class ProposalPreviewStatus extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    let { status } = proposal;
    if (proposal.trashed) {
      status = {
        color: 'default',
        name: (
          <FormattedMessage
            id={
              proposal.trashedStatus === 'VISIBLE'
                ? 'proposal.show.trashed.reason.moderated'
                : 'proposal.show.trashed.reason.deleted'
            }
          />
        ),
      };

      return (
        <>
          {proposal.trashedReason ? (
            <TrashedReasonContainer>
              <p className="px-15">
                <FormattedMessage id="proposal.show.trashed.shortReason" />
                <br />
                <span className="excerpt">{proposal.trashedReason}</span>
              </p>
            </TrashedReasonContainer>
          ) : null}
          <Card.Status bgColor={status.color}>{status && status.name}</Card.Status>
        </>
      );
    }

    if (!status) {
      return null;
    }

    return <Card.Status bgColor={status.color}>{status && status.name}</Card.Status>;
  }
}

export default createFragmentContainer(ProposalPreviewStatus, {
  proposal: graphql`
    fragment ProposalPreviewStatus_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID" }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      trashed
      trashedStatus
      trashedReason
      status(step: $stepId) @skip(if: $isProfileView) {
        name
        color
      }
    }
  `,
});
