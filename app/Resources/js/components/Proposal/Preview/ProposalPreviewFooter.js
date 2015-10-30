const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({
      'media__content': true,
    });

    return (
      <div className={classes}>
        <span className="excerpt small">
        {/*
          <FormattedMessage
            message={this.getIntlMessage('global.votes')}
            num={proposal.comments_count}
          />
          { ' • ' }
        */}
          <FormattedMessage
            message={this.getIntlMessage('global.comments')}
            num={proposal.comments_count}
          />
        </span>
      </div>
    );
  },

});

export default ProposalPreviewFooter;
