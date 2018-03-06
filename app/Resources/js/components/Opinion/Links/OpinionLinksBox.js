// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import OpinionLinkList from './OpinionLinkList';
import OpinionLinkCreate from './OpinionLinkCreate';
import Filter from '../../Utils/Filter';
import Loader from '../../Utils/Loader';
import OpinionLinkActions from '../../../actions/OpinionLinkActions';
import OpinionLinkStore from '../../../stores/OpinionLinkStore';

const OpinionLinksBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired
  },

  getInitialState() {
    const { opinion } = this.props;
    return {
      links: opinion.connections || [],
      isLoading: false,
      filter: 'last'
    };
  },

  componentWillMount() {
    OpinionLinkStore.addChangeListener(this.onChange);
  },

  componentDidUpdate(prevProps, prevState) {
    const { opinion } = this.props;
    if (this.state.filter !== prevState.filter) {
      OpinionLinkActions.load(opinion.id, this.state.filter);
    }
  },

  componentWillUnmount() {
    OpinionLinkStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      links: OpinionLinkStore.links,
      isLoading: false
    });
  },

  handleFilterChange(event) {
    this.setState({
      filter: event.target.value,
      isLoading: true,
      links: []
    });
  },

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionLinkCreate {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            {this.state.links.length > 1 ? (
              <Filter
                onChange={this.handleFilterChange}
                value={this.state.filter}
                values={['last', 'old']}
              />
            ) : null}
          </Col>
        </Row>
        {!this.state.isLoading ? <OpinionLinkList links={this.state.links} /> : <Loader />}
      </div>
    );
  }
});

export default OpinionLinksBox;
