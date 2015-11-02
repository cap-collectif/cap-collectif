import ProposalPreview from '../Preview/ProposalPreview';

const Row = ReactBootstrap.Row;

const ProposalList = React.createClass({
  propTypes: {
    proposals: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.proposals.length === 0) {
      return <p>{ this.getIntlMessage('proposal.empty') }</p>;
    }

    const classes = React.addons.classSet({
      'media-list': true,
      'opinion__list': true,
    });

    return (
      <Row componentClass="ul" className={classes}>
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
      </Row>
    );
  },

});

export default ProposalList;
