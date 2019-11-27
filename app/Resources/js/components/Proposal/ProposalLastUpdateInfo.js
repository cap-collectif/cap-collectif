// @flow
import * as React from 'react';
import moment from 'moment';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ProposalLastUpdateInfo_proposal } from '~relay/ProposalLastUpdateInfo_proposal.graphql';

type Props = {
  proposal: ProposalLastUpdateInfo_proposal,
};

export class ProposalLastUpdateInfo extends React.PureComponent<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <div>
        {proposal.updatedAt && ( // d M Y H:m
          <FormattedDate
            value={moment(proposal.updatedAt).toDate()}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        )}
        {proposal.updatedBy && (
          <div>
            <FormattedMessage id="global.written_by" />{' '}
            <a href={proposal.updatedBy.url}>{proposal.updatedBy.displayName}</a>
          </div>
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProposalLastUpdateInfo, {
  proposal: graphql`
    fragment ProposalLastUpdateInfo_proposal on Proposal {
      updatedAt
      updatedBy {
        url
        displayName
      }
    }
  `,
});
