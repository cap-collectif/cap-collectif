// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';
import type { ProposalDetailLikersTooltipLabel_proposal } from './__generated__/ProposalDetailLikersTooltipLabel_proposal.graphql';

type Props = { proposal: ProposalDetailLikersTooltipLabel_proposal };

export class ProposalDetailLikersTooltipLabel extends React.Component<Props> {

  render() {
    const { proposal } = this.props;
    if (proposal.likers.length === 1) {
      return (
        <Truncate>
          <FormattedMessage
            id="proposal.likers.label"
            values={{
              user: proposal.likers[0].displayName,
            }}
          />
        </Truncate>
      );
    }
    if (proposal.likers.length > 1) {
      const message = proposal.likers.map(liker => liker.displayName).join('<br/>');
      return (
        <span>
          <FormattedMessage
            id="proposal.likers.count"
            values={{
              num: proposal.likers.length,
            }}
          />
          <br />
          <Truncate>
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </Truncate>
        </span>
      );
    }
    return null;
  }
};

export default createFragmentContainer(
  ProposalDetailLikersTooltipLabel,
  {
    proposal: graphql`
      fragment ProposalDetailLikersTooltipLabel_proposal on Proposal {
        id
        likers {
          displayName
          id
        }
      }
    `,
  }
);
