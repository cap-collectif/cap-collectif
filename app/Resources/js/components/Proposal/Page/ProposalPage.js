import ProposalStore from '../../../stores/ProposalStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
import ProposalVoteBox from '../Vote/ProposalVoteBox';
import Loader from '../../Utils/Loader';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalPage = React.createClass({
  propTypes: {
    proposalId: React.PropTypes.number.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      proposal: null,
      isLoading: true,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadProposal();
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      proposal: ProposalStore.proposal,
    });
  },

  loadProposal() {
    ProposalActions.getOne(this.props.proposalId);
  },

  render() {
    const proposal = this.state.proposal;
    return (
      <div id="sidebar-container" className="container sidebar__container">
        <Loader show={this.state.isLoading}>
          <Row>
            <Col xs={12} sm={proposal.canContribute ? 9 : 12}>
              <ProposalPageHeader proposal={proposal} />
              <ProposalPageContent proposal={proposal}/>
              <ProposalPageVotes proposal={proposal}/>
              <ProposalPageComments proposal={proposal}/>
            </Col>
            <div id="sidebar-overlay" />
            {proposal.canContribute
              ? <ProposalVoteBox proposal={proposal} />
              : null
            }
          </Row>
        </Loader>
      </div>
    );
  },

});

export default ProposalPage;
