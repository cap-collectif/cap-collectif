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
    id: React.PropTypes.number.isRequired,
    fetchFrom: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    theme: PropTypes.array.isRequired,
    type: PropTypes.array.isRequired,
    district: PropTypes.array.isRequired,
    status: PropTypes.array.isRequired,
    category: PropTypes.array.isRequired,
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
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    if (this.props.orderByVotes) {
      this.orders.push('votes');
    }
    this.updateFilters();
  },

  componentWillReceiveProps() {
    this.updateFilters();
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

  orders: ['random', 'last', 'old', 'comments'],
  filters: ['status', 'type', 'district', 'theme', 'category'],

  updateFilters() {
    const filters = ['status', 'type'];
    if (this.props.features.districts) {
      filters.push('district');
    }
    if (this.props.features.themes && this.props.showThemes) {
      filters.push('theme');
    }
    if (this.props.category.length > 0) {
      filters.push('category');
    }
    this.filters = filters;
    this.forceUpdate();
  },

  handleOrderChange(ev) {
    const order = ev.target.value;
    ProposalActions.changeOrder(order);
  },

  handleFilterChange(filterName) {
    const value = this.refs[filterName].getValue();
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
              this.orders.map((choice) => {
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
          this.filters.map((filterName, index) => {
            return (
              <Col xs={12} md={6} key={index}>
                <Input
                  type="select"
                  id={'proposal-filter-' + filterName}
                  ref={filterName}
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
  return { features: state.features };
};

export default connect(mapStateToProps, null, null, { pure: false })(ProposalListFilters);
