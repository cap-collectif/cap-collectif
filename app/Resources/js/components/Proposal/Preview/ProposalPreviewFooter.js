const FormattedMessage = ReactIntl.FormattedMessage;
const Label = ReactBootstrap.Label;

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
        <div className="proposal__info">
        {/*
          <FormattedMessage
            message={this.getIntlMessage('global.votes')}
            num={proposal.comments_count}
          />
          { ' • ' }
        */}
          <i className="cap cap-baloon-1" />
          <FormattedMessage
            message={this.getIntlMessage('global.comments')}
            num={proposal.comments_count}
          />
        </div>
        {proposal.status
            ? <Label className="proposal__status" bsStyle={proposal.status.color}>{proposal.status.name}</Label>
            : null
         }
      </div>
    );
  },

});

export default ProposalPreviewFooter;
