import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

export const ProposalListFilters = React.createClass({
  propTypes: {
    id: PropTypes.number.isRequired,
    fetchFrom: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    themes: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    statuses: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    orderByVotes: PropTypes.bool,
    features: PropTypes.object.isRequired,
    showThemes: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      fetchFrom: 'form',
      orderByVotes: false,
    };
  },

  getInitialState() {
    return {
      order: ProposalStore.order,
      filters: ProposalStore.filters,
      displayedFilters: ['statuses', 'types', 'districts', 'themes', 'categories'],
      displayedOrders: ['random', 'last', 'old', 'comments'],
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    if (this.props.orderByVotes) {
      const orders = this.state.displayedOrders;
      orders.push('votes');
      this.setState({ displayedOrders: orders }); // eslint-disable-line react/no-did-mount-set-state
    }
    this.updateDisplayedFilters();
  },

  componentWillReceiveProps() {
    this.updateDisplayedFilters();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.order !== this.state.order || prevState.filters !== this.state.filters)) {
      this.reload();
      this.props.onChange();
    }
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      order: ProposalStore.order,
      filters: ProposalStore.filters,
    });
  },

  updateDisplayedFilters() {
    const filters = ['statuses', 'types'];
    if (this.props.features.districts) {
      filters.push('districts');
    }
    if (this.props.features.themes && this.props.showThemes) {
      filters.push('themes');
    }
    if (this.props.categories.length > 0) {
      filters.push('categories');
    }
    this.setState({ displayedFilters: filters });
  },

  handleOrderChange(ev) {
    const order = ev.target.value;
    ProposalActions.changeOrder(order);
  },

  handleFilterChange(filterName) {
    const value = this[filterName].getValue();
    ProposalActions.changeFilterValue(filterName, value);
    this.reload();
  },

  reload() {
    ProposalActions.load(this.props.fetchFrom, this.props.id);
  },

  render() {
    return (
    <div>
      <Row>
        <Col xs={12} md={6}>
          <Input
            id="proposal-sorting"
            type="select"
            onChange={this.handleOrderChange}
            value={this.state.order || 'random'}
          >
            {
              this.state.displayedOrders.map((choice) => {
                return (
                  <option key={choice} value={choice}>
                    {this.getIntlMessage('global.filter_f_' + choice)}
                  </option>
                );
              })
            }
          </Input>
        </Col>
        <Col xs={12} md={6}>
          <ProposalListSearch fetchFrom={this.props.fetchFrom} id={this.props.id} />
        </Col>
      </Row>
      <Row>
        {
          this.state.displayedFilters.map((filterName, index) => {
            return (
              <Col xs={12} md={6} key={index}>
                <Input
                  type="select"
                  id={'proposal-filter-' + filterName}
                  ref={(c) => this[filterName] = c}
                  onChange={this.handleFilterChange.bind(this, filterName)}
                  value={this.state.filters[filterName] || 0}
                >
                  <option value="0">
                    {this.getIntlMessage('global.select_' + filterName)}
                  </option>
                  {
                    this.props[filterName].map((choice) => {
                      return (
                        <option key={choice.id} value={choice.id}>
                          {choice.title || choice.name}
                        </option>
                      );
                    })
                  }
                </Input>
              </Col>
            );
          })
        }
      </Row>
    </div>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps, null, null, { pure: false })(ProposalListFilters);
