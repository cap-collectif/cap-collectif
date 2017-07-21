import React from 'react';
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const ProposalPageAlert = React.createClass({
  displayName: 'ProposalPageAlert',

  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },

  render() {
    const proposal = this.props.proposal;
    if (proposal.isTrashed) {
      return (
        <Alert
          bsStyle="warning"
          style={{ marginBottom: '0', textAlign: 'center' }}>
          <strong>
            {<FormattedMessage id="proposal.trashed.label" />}
          </strong>
          {proposal.trashedReason &&
            <span>
              {' '}<FormattedMessage
                id="proposal.trashed.motive"
                values={{
                  motive: proposal.trashedReason,
                }}
              />
            </span>}
        </Alert>
      );
    }
    return null;
  },
});

export default ProposalPageAlert;
