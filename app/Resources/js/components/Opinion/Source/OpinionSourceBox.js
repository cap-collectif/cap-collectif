// @flow
import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

import OpinionSourceList from './OpinionSourceList';
import OpinionSourceAdd from './OpinionSourceAdd';
import Loader from '../../Ui/Loader';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';
import CategoriesActions from '../../../actions/CategoriesActions';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import Filter from '../../Utils/Filter';

const OpinionSourceBox = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      sources: [],
      isLoading: true,
      filter: OpinionSourceStore.filter,
    };
  },

  componentWillMount() {
    OpinionSourceStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadSourcesFromServer();
    this.loadCategoriesFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadSourcesFromServer();
    }
  },

  componentWillUnmount() {
    OpinionSourceStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      sources: OpinionSourceStore.sources,
      filter: OpinionSourceStore.filter,
      isLoading: false,
    });
  },

  handleFilterChange(event) {
    this.setState({
      filter: event.target.value,
    });
  },

  loadSourcesFromServer() {
    const { opinion } = this.props;
    this.setState({ isLoading: true });
    OpinionSourceActions.load(opinion, this.state.filter);
  },

  loadCategoriesFromServer() {
    CategoriesActions.load();
  },

  render() {
    const { opinion } = this.props;
    const { sources, isLoading, filter } = this.state;
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionSourceAdd disabled={!opinion.isContribuable} />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Filter show={sources.length > 1} value={filter} onChange={this.handleFilterChange} />
          </Col>
        </Row>
        <Loader show={isLoading}>
          <OpinionSourceList sources={sources} />
        </Loader>
      </div>
    );
  },
});

export default OpinionSourceBox;
