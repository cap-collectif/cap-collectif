import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
const Button = ReactBootstrap.Button;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  isTheAuthor() {
    return false;
  },

  render() {
    const proposal = this.props.proposal;
    console.log(proposal);
    return (
      <div className="container--custom container--with-sidebar">
        <div className="block">
          <h2 className="h2">{ this.getIntlMessage('proposal.description') }</h2>
          <div dangerouslySetInnerHTML={{__html: proposal.body}} />
        </div>
        {
          proposal.responses.map((response) => {
            return (
              <div className="block">
                <h2 className="h2">{ response.question.title }</h2>
                <div dangerouslySetInnerHTML={{__html: response.value}} />
              </div>
            );
          })
        }
        <div className="block">
          <ShareButtonDropdown
            url={proposal._links.show}
            title={proposal.title}
          />
          {this.isTheAuthor()
            ? <Button>Supprimer</Button>
            : null
          }
        </div>
      </div>
    );
  },

});

export default ProposalPageHeader;
