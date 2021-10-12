// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { ProposalAdminFollowers_proposal } from '~relay/ProposalAdminFollowers_proposal.graphql';
import ProposalPageFollowers from '../Page/Followers/ProposalPageFollowers';

type Props = {|
  proposal: ProposalAdminFollowers_proposal,
  intl: IntlShape,
|};

export class ProposalAdminFollowers extends React.Component<Props> {
  render() {
    const { proposal, intl } = this.props;
    const totalCount = proposal.allFollowers ? proposal.allFollowers.totalCount : 0;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.follower.count" values={{ num: totalCount }} />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.proposal.subscribers' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <div className="clearfix" />
          <ProposalPageFollowers proposal={proposal} pageAdmin />
        </div>
      </div>
    );
  }
}

const container = injectIntl(ProposalAdminFollowers);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminFollowers_proposal on Proposal {
      ...ProposalPageFollowers_proposal @arguments(count: $count, cursor: $cursor)
      id
      allFollowers: followers(first: 0) {
        totalCount
      }
    }
  `,
});
