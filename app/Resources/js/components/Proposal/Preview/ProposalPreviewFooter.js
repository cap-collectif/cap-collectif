const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const statusClasses = {
      'proposal__status': true,
      'status--default': !proposal.status,
    };
    if (proposal.status) {
      statusClasses['status--' + proposal.status.color] = true;
    }

    return (
      <div className="proposal__footer">
        <div className="proposal__counters">
          <div className="proposal__counter">
            <div className="proposal__counter__value" >
              {proposal.comments_count}
            </div>
            <div className="proposal__counter__label" >
              <FormattedMessage
                message={this.getIntlMessage('comment.count_no_nb')}
                count={proposal.comments_count}
              />
            </div>
          </div>
        </div>
        <div className={classNames(statusClasses)}>
          {
            proposal.status
            ? proposal.status.name
            : this.getIntlMessage('proposal.no_status')
          }
        </div>
      </div>
    );
  },

});

export default ProposalPreviewFooter;
