import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
const Button = ReactBootstrap.Button;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    return (
      <div className="container--custom container--with-sidebar">
        <div className="block">
          <h2 className="h2">Description</h2>
          <p>{proposal.content}</p>
        </div>
        <div className="block">
          <ShareButtonDropdown />
          <Button className="pull-right no-float-mobile">Signaler</Button>
        </div>
      </div>
    );
  },

});

export default ProposalPageHeader;
