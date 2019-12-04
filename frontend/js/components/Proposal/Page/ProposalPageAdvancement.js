// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalDetailAdvancement from '../Detail/ProposalDetailAdvancement';
import type { ProposalPageAdvancement_proposal } from '~relay/ProposalPageAdvancement_proposal.graphql';

type Props = { proposal: ProposalPageAdvancement_proposal };

export class ProposalPageAdvancement extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <div className="proposal__page__metadata">
        <div className="proposal__infos">
          <ProposalDetailAdvancement proposal={proposal} />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(ProposalPageAdvancement, {
  proposal: graphql`
    fragment ProposalPageAdvancement_proposal on Proposal {
      ...ProposalDetailAdvancement_proposal
    }
  `,
});
