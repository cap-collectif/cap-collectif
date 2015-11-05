const ProposalPageAnswer = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    if (!proposal.answer) {
      return null;
    }
    return (
      <div className="container--custom container--with-sidebar">
        <div className="block">
          {proposal.answer.title
            ? <h2 className="h2">{proposal.answer.title}</h2>
            : null
          }
          <div dangerouslySetInnerHTML={{__html: proposal.answer.body}} />
        </div>
      </div>
    );
  },

});

export default ProposalPageAnswer;
