// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionVersionList from './OpinionVersionList';
import OpinionVersionCreateButton from './OpinionVersionCreateButton';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';
import OpinionVersionCreateModal from './OpinionVersionCreateModal';

const OpinionVersionsBox = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.string.isRequired,
    opinionBody: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      versions: [],
      isLoading: true,
      filter: 'last',
      offset: 0,
      rankingThreshold: null,
    };
  },

  componentDidMount() {
    this.loadVersionsFromServer();
  },

  componentDidUpdate(prevProps: Object, prevState: Object) {
    if (this.state.filter !== prevState.filter) {
      this.loadVersionsFromServer();
    }
  },

  updateSelectedValue() {
    const element = ReactDOM.findDOMNode(this.refs.filter);
    if (element instanceof Element) {
      this.setState({
        filter: $(element).val(),
        isLoading: true,
        versions: [],
      });
    }
  },

  loadVersionsFromServer() {
    const { opinionId } = this.props;
    this.setState({ isLoading: true });

    Fetcher.get(
      `/opinions/${opinionId}/versions?offset=${this.state.offset}&filter=${this.state.filter}`,
    ).then(data => {
      this.setState({
        isLoading: false,
        versions: data.versions,
        rankingThreshold: data.rankingThreshold,
      });
      return true;
    });
  },

  renderFilter() {
    if (this.state.versions.length > 1) {
      return (
        <form>
          <label htmlFor="filter-opinion-version" className="control-label h5 sr-only">
            <FormattedMessage id="opinion.version.filter" />
          </label>
          <select
            id="filter-opinion-version"
            ref="filter"
            className="form-control pull-right"
            value={this.state.filter}
            onChange={() => this.updateSelectedValue()}>
            <FormattedMessage id="global.filter_random">
              {message => <option value="random">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_last">
              {message => <option value="last">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_old">
              {message => <option value="old">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_favorable">
              {message => <option value="favorable">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_votes">
              {message => <option value="votes">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_comments">
              {message => <option value="comments">{message}</option>}
            </FormattedMessage>
          </select>
        </form>
      );
    }
  },

  render() {
    return (
      <div>
        <OpinionVersionCreateModal />
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionVersionCreateButton {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            {this.renderFilter()}
          </Col>
        </Row>
        {!this.state.isLoading ? (
          <OpinionVersionList
            versions={this.state.versions}
            rankingThreshold={this.state.rankingThreshold}
          />
        ) : (
          <Loader />
        )}
      </div>
    );
  },
});

export default OpinionVersionsBox;
