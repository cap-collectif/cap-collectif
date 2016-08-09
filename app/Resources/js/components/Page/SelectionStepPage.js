import React, { PropTypes } from 'react';
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
    proposals: PropTypes.array.isRequired,
    themes: PropTypes.array.isRequired,
    statuses: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    step: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    showThemes: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const {
      count,
      proposals,
      step,
    } = this.props;
    ProposalActions.initProposals(proposals, count);
    ProposalActions.initProposalVotes(step.creditsLeft);
    ProposalActions.changeOrder(step.defaultOrder);
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
    const { step } = this.props;
    this.setState({
      isLoading: true,
    });
    ProposalActions.load('selectionStep', step.id);
  },

  handleFilterOrOrderChange() {
    this.setState({ isLoading: true });
  },

  selectPage(newPage) {
    this.setState({ isLoading: true });
    ProposalActions.changePage(newPage);
  },

  render() {
    const {
      categories,
      districts,
      showThemes,
      statuses,
      step,
      themes,
      types,
    } = this.props;
    const nbPages = Math.ceil(this.state.proposalsCount / PROPOSAL_PAGINATION);
    const showRandomButton = nbPages > 1 && this.state.randomOrder;
    const showPagination = nbPages > 1 && !this.state.randomOrder;
    return (
      <div>
        <StepPageHeader step={step} />
        <h3 className="h3" style={{ marginBottom: '15px' }}>
          <FormattedMessage
            message={this.getIntlMessage('proposal.count')}
            num={this.state.proposalsCount}
          />
        </h3>
        <ProposalListFilters
          id={step.id}
          fetchFrom="selectionStep"
          themes={themes}
          districts={districts}
          types={types}
          statuses={statuses}
          categories={categories}
          onChange={() => this.handleFilterOrOrderChange()}
          orderByVotes={step.voteType !== VOTE_TYPE_DISABLED}
          showThemes={showThemes}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <div>
            <ProposalList
              proposals={this.state.proposals}
              selectionStep={step}
              creditsLeft={this.state.creditsLeft}
              showThemes={showThemes}
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
