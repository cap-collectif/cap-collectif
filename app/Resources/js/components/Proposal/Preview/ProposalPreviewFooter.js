
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
          {proposal.votes_count}
          {proposal.comments_count}
        </span>
      </div>
    );
  },

});

export default ProposalPreviewFooter;
