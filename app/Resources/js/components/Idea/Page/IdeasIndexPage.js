import React from 'react';
import { IntlMixin } from 'react-intl';
import IdeaStore from '../../../stores/IdeaStore';
import IdeaActions from '../../../actions/IdeaActions';
import { DEFAULT_IDEAS_PAGINATION } from '../../../constants/IdeaConstants';
import Loader from '../../Utils/Loader';
import IdeasListFilters from '../List/IdeasListFilters';
import IdeasIndexHeader from './IdeasIndexHeader';
import IdeasIndexFooter from './IdeasIndexFooter';
import IdeasPaginatedList from '../List/IdeasPaginatedList';

const IdeasIndexPage = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    countTrashed: React.PropTypes.number.isRequired,
    pagination: React.PropTypes.number,
    ideas: React.PropTypes.array.isRequired,
    themes: React.PropTypes.array.isRequired,
    trashUrl: React.PropTypes.string,
    description: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      trashUrl: null,
      description: null,
      pagination: DEFAULT_IDEAS_PAGINATION,
    };
  },

  getInitialState() {
    return {
      ideas: IdeaStore.ideas,
      count: IdeaStore.count,
      countTrashed: IdeaStore.countTrashed,
      isLoading: false,
    };
  },

  componentWillMount() {
    IdeaStore.addChangeListener(this.onChange);
    IdeaActions.setPagination(this.props.pagination);
    IdeaActions.initCounts(this.props.count, this.props.countTrashed);
    IdeaActions.initIdeas(this.props.ideas);
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.currentPage !== this.state.currentPage)) {
      this.loadIdeas();
    }
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      ideas: IdeaStore.ideas,
      count: IdeaStore.count,
      countTrashed: IdeaStore.countTrashed,
      currentPage: IdeaStore.currentPage,
      isLoading: false,
    });
    return;
  },

  loadIdeas() {
    this.setState({
      isLoading: true,
    });
    IdeaActions.load();
  },

  selectPage(newPage) {
    this.setState({ isLoading: true });
    IdeaActions.changePage(newPage);
  },

  handleThemeOrOrderChange() {
    this.setState({ isLoading: true });
  },

  render() {
    const currentPage = IdeaStore.currentPage;
    const pagination = IdeaStore.pagination;
    const nbPages = Math.ceil(this.state.count / pagination);
    return (
      <div>
        <IdeasIndexHeader description={this.props.description} />
        <div className="container container--custom">
          <IdeasListFilters
            themes={this.props.themes}
            onChange={this.handleThemeOrOrderChange}
          />
          <br />
          <Loader show={this.state.isLoading}>
            <IdeasPaginatedList
              ideas={this.state.ideas}
              currentPage={currentPage}
              nbPages={nbPages}
              onChangePage={this.selectPage}
            />
          </Loader>
        </div>
        <IdeasIndexFooter trashUrl={this.props.trashUrl} countTrashed={this.state.countTrashed} />
      </div>
    );
  },

});

export default IdeasIndexPage;
