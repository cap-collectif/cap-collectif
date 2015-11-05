import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
// import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
// import ProposalVoteBox from '../Vote/ProposalVoteBox';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalPage = React.createClass({
  propTypes: {
    formId: React.PropTypes.number.isRequired,
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    return (
      <div id="sidebar-container" className="container sidebar__container">
        <Row>
          <Col xs={12}>
            <ProposalPageHeader proposal={proposal} />
            <ProposalPageAnswer proposal={proposal} />
            <ProposalPageContent proposal={proposal} />
            {/* <ProposalPageVotes proposal={proposal} /> */}
            <ProposalPageComments formId={this.props.formId} id={proposal.id} />
          </Col>
          {/* <div id="sidebar-overlay" /> */}
          {/* proposal.canContribute
            ? <ProposalVoteBox proposal={proposal} />
            : null
          */}
        </Row>
      </div>
    );
  },

});

export default ProposalPage;
