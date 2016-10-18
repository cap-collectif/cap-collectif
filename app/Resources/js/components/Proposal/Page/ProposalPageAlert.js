import React from 'react';
import { Alert } from 'react-bootstrap';
import { IntlMixin, FormattedMessage } from 'react-intl';

const ProposalPageAlert = React.createClass({
  displayName: 'ProposalPageAlert',
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const proposal = this.props.proposal;
    if (proposal.isTrashed) {
      return (
        <Alert
          bsStyle="warning"
          style={{ marginBottom: '0', textAlign: 'center' }}
        >
          <strong>{this.getIntlMessage('proposal.trashed.label')}</strong>
          {
            proposal.trashedReason &&
               <span>
                  {' '}
                  <FormattedMessage
                    message={this.getIntlMessage('proposal.trashed.motive')}
                    motive={proposal.trashedReason}
                  />
              </span>
          }
        </Alert>
      );
    }
    return null;
  },

});

export default ProposalPageAlert;
