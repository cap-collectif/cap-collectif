import UserPreview from '../../User/UserPreview';

const Row = ReactBootstrap.Row;
const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPageVotes = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    return (
      <div className="container--custom container--with-sidebar">
        <h2>
          <FormattedMessage
            message={this.getIntlMessage('proposal.vote.count')}
            num={proposal.votes_count}
          />
        </h2>
        <Row>
          {
            proposal.votes.map((vote) => {
              return <UserPreview user={vote.user} />;
            })
          }
        </Row>
      </div>
    );
  },

});

export default ProposalPageVotes;
