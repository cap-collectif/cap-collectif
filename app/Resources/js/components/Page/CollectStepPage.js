import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import CollectStepPageHeader from './CollectStepPageHeader';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';

const CollectStepPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
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
    console.log(this.props, this.state);
    this.loadProposals();
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({proposals: ProposalStore.proposals});
  },

  loadProposals() {
    ProposalActions.load(this.props.form.id);
  },

  render() {
    return (
      <div>
        {/*<CollectStepPageHeader form={this.props.form} />*/}
        {/*<ProposalListFilters />*/}
        <Loader show={this.state.isLoading}>
          <ProposalList proposals={this.state.proposals} />
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
