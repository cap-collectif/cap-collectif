import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import {PROPOSAL_PAGINATION} from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';

const CollectStepPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    statuses: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    types: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      proposals: ProposalStore.proposals,
      proposalsCount: ProposalStore.proposalsCount,
      currentPage: ProposalStore.currentPage,
      isLoading: true,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadProposals();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.currentPage !== this.state.currentPage)) {
      this.loadProposals();
    }
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      proposals: ProposalStore.proposals,
      proposalsCount: ProposalStore.proposalsCount,
      currentPage: ProposalStore.currentPage,
      isLoading: false,
    });
  },

  loadProposals() {
    ProposalActions.load(this.props.form.id);
  },

  handleFilterOrOrderChange() {
    this.setState({isLoading: true});
  },

  selectPage(newPage) {
    this.setState({isLoading: true});
    ProposalActions.changePage(newPage);
  },

  render() {
    const nbPages = Math.ceil(this.state.proposalsCount / PROPOSAL_PAGINATION);
    return (
      <div>
        <ProposalListFilters
          id={this.props.form.id}
          theme={this.props.themes}
          district={this.props.districts}
          type={this.props.types}
          status={this.props.statuses}
          onChange={() => this.handleFilterOrOrderChange()}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <div>
            <ProposalList proposals={this.state.proposals} />
            {
              nbPages > 1
              ? <Pagination
                  current={this.state.currentPage}
                  nbPages={nbPages}
                  onChange={this.selectPage}
                />
              : null
            }
          </div>
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
