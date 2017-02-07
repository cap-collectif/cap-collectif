// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';

const OpinionVersionsBox = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    opinionBody: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

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
    this.setState({
      filter: $(ReactDOM.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      versions: [],
    });
  },

  loadVersionsFromServer() {
    const { opinionId } = this.props;
    this.setState({ isLoading: true });

    Fetcher
    .get(`/opinions/${opinionId}/versions?offset=${this.state.offset}&filter=${this.state.filter}`)
    .then((data) => {
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
            {this.getIntlMessage('opinion.version.filter')}
          </label>
          <select id="filter-opinion-version" ref="filter" className="form-control pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
            <option value="random">{this.getIntlMessage('global.filter_random')}</option>
            <option value="last">{this.getIntlMessage('global.filter_last')}</option>
            <option value="old">{this.getIntlMessage('global.filter_old')}</option>
            <option value="favorable">{this.getIntlMessage('global.filter_favorable')}</option>
            <option value="votes">{this.getIntlMessage('global.filter_votes')}</option>
            <option value="comments">{this.getIntlMessage('global.filter_comments')}</option>
          </select>
        </form>
      );
    }
  },

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionVersionForm {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            { this.renderFilter() }
          </Col>
        </Row>
        {!this.state.isLoading
          ? <OpinionVersionList versions={this.state.versions} rankingThreshold={this.state.rankingThreshold} />
          : <Loader />
        }
      </div>
    );
  },

});

export default OpinionVersionsBox;
