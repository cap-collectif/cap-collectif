const Alert = ReactBootstrap.Alert;
const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPageAlert = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    if (proposal.isTrashed) {
      const motive = proposal.trashedReason || this.getIntlMessage('proposal.trashed.no_motive');
      return (
        <Alert
          bsStyle="warning"
          style={{marginBottom: '0', textAlign: 'center'}}
        >
          {this.getIntlMessage('proposal.trashed.label') + ' '}
          <FormattedMessage
            message={this.getIntlMessage('proposal.trashed.motive')}
            motive={motive}
          />
        </Alert>
      );
    }
    return null;
  },

});

export default ProposalPageAlert;
