// @flow
import React from 'react';
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
    const { count, countTrashed, ideas, pagination } = this.props;
    IdeaStore.addChangeListener(this.onChange);
    IdeaActions.setPagination(pagination);
    IdeaActions.initCounts(count, countTrashed);
    IdeaActions.initIdeas(ideas);
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && prevState.currentPage !== this.state.currentPage) {
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
    const { description, themes, trashUrl } = this.props;
    const currentPage = IdeaStore.currentPage;
    const pagination = IdeaStore.pagination;
    const nbPages = Math.ceil(this.state.count / pagination);
    return (
      <div>
        <IdeasIndexHeader description={description} />
        <div className="container container--custom">
          <IdeasListFilters
            themes={themes}
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
        <IdeasIndexFooter
          trashUrl={trashUrl}
          countTrashed={this.state.countTrashed}
        />
      </div>
    );
  },
});

export default IdeasIndexPage;
