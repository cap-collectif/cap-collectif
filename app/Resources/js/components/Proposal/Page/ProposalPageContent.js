import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
const Button = ReactBootstrap.Button;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    console.log(proposal);
    return (
      <div className="container--custom container--with-sidebar">
        <div className="block">
          <h2 className="h2">{ this.getIntlMessage('proposal.description') }</h2>
          <p>{proposal.body}</p>
        </div>
        <div className="block">
          <ShareButtonDropdown
            url={proposal._links.show}
            title={proposal.title}
          />
          <Button>Signaler</Button>
        </div>
      </div>
    );
  },

});

export default ProposalPageHeader;
