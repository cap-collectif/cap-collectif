const ProposalCreateInfos = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <p>{this.getIntlMessage('proposal.create.infos')}</p>
    );
  },

});

export default ProposalCreateInfos;
