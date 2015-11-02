const ProposalCreateInfos = React.createClass({
  propTypes: {},
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="modal-top bg-warning">
        <p>
          { this.getIntlMessage('proposal.create.infos') }
        </p>
      </div>
    );
  },

});

export default ProposalCreateInfos;
