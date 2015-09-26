const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;

    const classes = 'proposal__status status--' + proposal.status.color;

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
        {
          proposal.status
            ? <div className={classes}>{proposal.status.name}</div>
            : null
        }
      </div>
    );
  },

});

export default ProposalPreviewFooter;
