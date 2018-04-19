// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';
import type { ProposalDetailLikers_proposal } from './__generated__/ProposalDetailLikers_proposal.graphql';

type Props = {
  proposal: ProposalDetailLikers_proposal,
  componentClass: string,
};

export class ProposalDetailLikers extends React.Component<Props> {
  static defaultProps = {
      componentClass: 'span',
  };

  renderContent() {
    const { proposal } = this.props;
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`proposal-${proposal.id}-likers-tooltip-`}>
            {/* $FlowFixMe */}
            <ProposalDetailLikersTooltipLabel proposal={proposal} />
          </Tooltip>
        }>
        {/* $FlowFixMe */}
        <ProposalDetailLikersLabel proposal={proposal} />
      </OverlayTrigger>
    );
  }

  render() {
    const { proposal, componentClass } = this.props;
    const Component = componentClass;
    if (proposal.likers.length > 0) {
      return <Component className="tags-list__tag">{this.renderContent()}</Component>;
    }

    return null;
  }
};

export default createFragmentContainer(
  ProposalDetailLikers,
  {
    proposal: graphql`
      fragment ProposalDetailLikers_proposal on Proposal {
        id
        likers {
          id
        }
        ...ProposalDetailLikersLabel_proposal
        ...ProposalDetailLikersTooltipLabel_proposal
      }
    `,
  }
);
