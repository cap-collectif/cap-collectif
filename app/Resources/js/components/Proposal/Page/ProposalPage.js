import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteSidebar from '../Vote/ProposalVoteSidebar';
import FlashMessages from '../../Utils/FlashMessages';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    proposal: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    votes: React.PropTypes.array.isRequired,
    votableStep: React.PropTypes.object,
    userHasVote: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      votableStep: null,
    };
  },

  getInitialState() {
    ProposalStore.initProposalData(this.props.proposal, this.props.userHasVote, this.props.votableStep);
    return {
      messages: {
        'errors': [],
        'success': [],
      },
      proposal: ProposalStore.proposal,
      userHasVote: ProposalStore.userHasVote,
      votableStep: ProposalStore.votableStep,
      expandSidebar: false,
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
        userHasVote: ProposalStore.userHasVote,
        votableStep: ProposalStore.votableStep,
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

  toggleSidebarExpand() {
    this.setState({
      expandSidebar: !this.state.expandSidebar,
    });
  },

  render() {
    const proposal = this.state.proposal;
    const showSidebar = !!this.state.votableStep;
    const wrapperClassName = classNames({
      'container': showSidebar,
      'sidebar__container': showSidebar,
    });
    const containersClassName = classNames({
      'container': !showSidebar,
      'container--thinner': !showSidebar,
      'container--custom': true,
      'container--with-sidebar': showSidebar,
    });
    const overlayClassName = classNames({
      'sidebar__darkened-overlay': this.state.expandSidebar,
    });
    return (
      <div>
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} style={{marginBottom: 0}} />
        <div id="sidebar-container" className={wrapperClassName}>
          <Row>
            <Col xs={12} sm={showSidebar ? 9 : 12}>
              <ProposalPageAlert proposal={proposal} />
              <ProposalPageHeader
                proposal={proposal}
                className={containersClassName}
              />
              {
                proposal.answer
                  ? <ProposalPageAnswer
                      answer={proposal.answer}
                      className={containersClassName}
                  />
                  : null
              }
              <ProposalPageContent
                proposal={proposal}
                form={this.props.form}
                themes={this.props.themes}
                districts={this.props.districts}
                className={containersClassName}
              />
              <ProposalPageVotes
                proposal={proposal}
                votes={this.props.votes}
                className={containersClassName}
              />
              <ProposalPageComments
                form={this.props.form}
                id={proposal.id}
                className={containersClassName}
              />
            </Col>
            {
              showSidebar
              ? <div id="sidebar-overlay" className={overlayClassName} />
              : null
            }
            {
              showSidebar
              ? <ProposalVoteSidebar
                  proposal={proposal}
                  votableStep={this.state.votableStep}
                  userHasVote={this.state.userHasVote}
                  expanded={this.state.expandSidebar}
                  onToggleExpand={this.toggleSidebarExpand}
              />
              : null
            }
          </Row>
        </div>
      </div>
    );
  },

});

export default ProposalPage;
