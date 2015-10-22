import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import ProposalListFilters from '../Proposal/ProposalListFilters';
import CollectStepPageHeader from './CollectStepPageHeader';
import ProposalList from '../Proposal/ProposalList';
import Loader from '../Utils/Loader';

const CollectStepPage = React.createClass({
  propTypes: {
    formId: React.PropTypes.number.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      form: null,
      proposals: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadForm();
    this.loadProposals();
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    // if (!OpinionStore.isProcessing && OpinionStore.isOpinionSync) {
    //   this.setState({
    //     opinion: OpinionStore.opinion,
    //     rankingThreshold: OpinionStore.rankingThreshold,
    //     opinionTerm: OpinionStore.opinionTerm,
    //     isLoading: false,
    //     messages: OpinionStore.messages,
    //   });
    //   return;
    // }

    // this.loadOpinion();
  },

  loadProposals() {
    ProposalActions.load(this.props.formId);
  },

  render() {
    return (
      <div>
        <CollectStepPageHeader />
        <ProposalListFilters />
        <Loader show={this.state.isLoading}>
          <ProposalList proposals={this.state.proposals} />
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
