import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import ProposalStore from '../../stores/ProposalStore';
import ProposalVoteStore from '../../stores/ProposalVoteStore';
import ProposalActions from '../../actions/ProposalActions';
import { PROPOSAL_PAGINATION } from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';
import { VOTE_TYPE_DISABLED } from '../../constants/ProposalConstants';
import ProposalRandomButton from '../Proposal/List/ProposalRandomButton';
import StepPageHeader from '../Steps/Page/StepPageHeader';

const SelectionStepPage = React.createClass({
  propTypes: {
    proposals: React.PropTypes.array.isRequired,
    themes: React.PropTypes.array.isRequired,
    statuses: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    types: React.PropTypes.array.isRequired,
    step: React.PropTypes.object.isRequired,
    count: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    ProposalActions.initProposals(this.props.proposals, this.props.count);
    ProposalActions.initProposalVotes(this.props.step.creditsLeft);
    ProposalActions.initSortOrder(this.props.step.defaultOrder);
    return {
      proposals: ProposalStore.proposals,
      proposalsCount: ProposalStore.proposalsCount,
      currentPage: ProposalStore.currentPage,
      creditsLeft: ProposalVoteStore.creditsLeft,
      randomOrder: ProposalStore.order === 'random',
      isLoading: false,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
    ProposalVoteStore.addChangeListener(this.onVoteChange);
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.currentPage !== this.state.currentPage)) {
      this.loadProposals();
    }
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
    ProposalVoteStore.removeChangeListener(this.onVoteChange);
  },

  onVoteChange() {
    this.setState({
      creditsLeft: ProposalVoteStore.creditsLeft,
    });
  },

  onChange() {
    if (!ProposalStore.isProcessing && ProposalStore.isProposalListSync) {
      this.setState({
        proposals: ProposalStore.proposals,
        proposalsCount: ProposalStore.proposalsCount,
        currentPage: ProposalStore.currentPage,
        isLoading: false,
        randomOrder: ProposalStore.order === 'random',
      });
      return;
    }

    this.loadProposals();
  },

  loadProposals() {
    this.setState({
      isLoading: true,
    });
    ProposalActions.load('selectionStep', this.props.step.id);
  },

  handleFilterOrOrderChange() {
    this.setState({ isLoading: true });
  },

  selectPage(newPage) {
    this.setState({ isLoading: true });
    ProposalActions.changePage(newPage);
  },

  render() {
    const nbPages = Math.ceil(this.state.proposalsCount / PROPOSAL_PAGINATION);
    const showRandomButton = nbPages > 1 && this.state.randomOrder;
    const showPagination = nbPages > 1 && !this.state.randomOrder;
    return (
      <div>
        <StepPageHeader step={this.props.step} />
        <h3 className="h3" style={{ marginBottom: '15px' }}>
          <FormattedMessage
            message={this.getIntlMessage('proposal.count')}
            num={this.state.proposalsCount}
          />
        </h3>
        <ProposalListFilters
          id={this.props.step.id}
          fetchFrom="selectionStep"
          theme={this.props.themes}
          district={this.props.districts}
          type={this.props.types}
          status={this.props.statuses}
          onChange={() => this.handleFilterOrOrderChange()}
          orderByVotes={this.props.step.voteType !== VOTE_TYPE_DISABLED}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <div>
            <ProposalList
              proposals={this.state.proposals}
              selectionStep={this.props.step}
              creditsLeft={this.state.creditsLeft}
            />
            {
              showPagination
              ? <Pagination
                  current={this.state.currentPage}
                  nbPages={nbPages}
                  onChange={this.selectPage}
              />
              : null
            }
            {
              showRandomButton
                ? <ProposalRandomButton isLoading={this.state.isLoading} onClick={this.loadProposals} />
                : null
            }
          </div>
        </Loader>
      </div>
    );
  },

});

export default SelectionStepPage;
