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
    formId: React.PropTypes.number.isRequired,
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
    ProposalActions.getOne(this.props.formId, this.props.proposalId);
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      proposal: ProposalStore.proposal,
      isLoading: false,
    });
  },

  render() {
    const proposal = this.state.proposal;
    return (
      <div id="sidebar-container" className="container sidebar__container">
        <Loader show={this.state.isLoading}>
          <Row>
            <Col xs={12} sm={proposal.canContribute ? 9 : 12}>
              <ProposalPageHeader proposal={proposal} />
              {/* <ProposalPageContent proposal={proposal} /> */}
              {/* <ProposalPageVotes proposal={proposal} /> */}
              {/*<ProposalPageComments formId={this.props.formId} id={proposal.id} /> */}
            </Col>
            <div id="sidebar-overlay" />
            {/*proposal.canContribute
              ? <ProposalVoteBox proposal={proposal} />
              : null
            */}
          </Row>
        </Loader>
      </div>
    );
  },

});

export default ProposalPage;
