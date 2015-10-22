const Label = ReactBootstrap.Label;

const ProposalPreviewBody = React.createClass({
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
        <h2>
          {proposal.title}
        </h2>
        <div>
          {proposal.body}
        </div>
        <Label>{proposal.status}</Label>
      </div>
    );
  },

});

export default ProposalPreviewBody;
