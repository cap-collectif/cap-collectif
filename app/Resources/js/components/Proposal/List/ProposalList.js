import ProposalPreview from '../Preview/ProposalPreview';

const ProposalList = React.createClass({
  propTypes: {
    proposals: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.proposals.length === 0) {
      return null;
    }

    const classes = React.addons.classSet({
      'media-list': true,
      'opinion__list': true,
    });

    return (
      <ul className={classes}>
        {
          this.props.proposals.map((proposal) => {
            return (
              <ProposalPreview
                key={proposal.id}
                proposal={proposal}
              />
            );
          })
        }
      </ul>
    );
  },

});

export default ProposalList;
