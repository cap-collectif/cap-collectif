import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';

const CollectStepPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      proposals: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadProposals();
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      proposals: ProposalStore.proposals,
      isLoading: false,
    });
  },

  loadProposals() {
    ProposalActions.load(this.props.form.id);
  },

  handleFilterChange() {
    this.setState({isLoading: true});
  },

  render() {
    return (
      <div>
        <ProposalListFilters
          id={this.props.form.id}
          theme={this.props.themes}
          onChange={() => this.handleFilterChange()}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <ProposalList proposals={this.state.proposals} />
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
