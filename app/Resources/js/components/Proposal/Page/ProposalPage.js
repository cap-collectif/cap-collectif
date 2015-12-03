import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageAlert from './ProposalPageAlert';
// import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalActions from '../../../actions/ProposalActions';
// import ProposalVoteBox from '../Vote/ProposalVoteBox';
import FlashMessages from '../../Utils/FlashMessages';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    proposal: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    ProposalStore.initProposal(this.props.proposal);
    return {
      messages: {
        'errors': [],
        'success': [],
      },
      proposal: ProposalStore.proposal,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (ProposalStore.isProposalSync) {
      this.setState({
        messages: ProposalStore.messages,
        proposal: ProposalStore.proposal,
      });
      return;
    }

    this.loadProposal();
  },

  loadProposal() {
    ProposalActions.getOne(
      this.props.form.id,
      this.state.proposal.id
    );
  },

  render() {
    const proposal = this.state.proposal;
    return (
      <div>
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} style={{marginBottom: 0}} />
        <ProposalPageAlert proposal={proposal} />
        <div id="sidebar-container" className="container sidebar__container">
          <Row>
            <Col xs={12}>
              <ProposalPageHeader proposal={proposal} />
              {
                proposal.answer
                  ? <ProposalPageAnswer answer={proposal.answer} />
                  : null
              }
              <ProposalPageContent
                proposal={proposal}
                form={this.props.form}
                themes={this.props.themes}
                districts={this.props.districts}
              />
              {/* <ProposalPageVotes proposal={proposal} /> */}
              <ProposalPageComments form={this.props.form} id={proposal.id} />
            </Col>
            {/* <div id="sidebar-overlay" /> */}
            {/* proposal.canContribute
              ? <ProposalVoteBox proposal={proposal} />
              : null
            */}
          </Row>
        </div>
      </div>
    );
  },

});

export default ProposalPage;
