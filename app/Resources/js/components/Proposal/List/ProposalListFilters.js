import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { changeFilter, changeOrder, loadProposals } from '../../../redux/modules/proposal';

export const ProposalListFilters = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    statuses: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    orderByVotes: PropTypes.bool,
    features: PropTypes.object.isRequired,
    showThemes: PropTypes.bool.isRequired,
    order: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      orderByVotes: false,
    };
  },

  getInitialState() {
    return {
      displayedFilters: ['statuses', 'types', 'districts', 'themes', 'categories'],
      displayedOrders: ['random', 'last', 'old', 'comments'],
    };
  },

  componentDidMount() {
    const { orderByVotes } = this.props;
    if (orderByVotes) {
      const orders = this.state.displayedOrders;
      orders.push('votes');
      this.setState({ displayedOrders: orders }); // eslint-disable-line react/no-did-mount-set-state
    }
    this.updateDisplayedFilters();
  },

  componentDidUpdate(prevProps) {
    if (prevProps && (prevProps.order !== this.props.order || prevProps.filters !== this.props.filters)) {
      this.props.dispatch(loadProposals());
    }
  },

  updateDisplayedFilters() {
    const {
      categories,
      features,
      showThemes,
    } = this.props;
    const filters = ['statuses', 'types'];
    if (features.districts) {
      filters.push('districts');
    }
    if (features.themes && showThemes) {
      filters.push('themes');
    }
    if (categories.length > 0) {
      filters.push('categories');
    }
    this.setState({ displayedFilters: filters });
  },

  render() {
    return null;
    const {
      order,
      dispatch,
      filters,
    } = this.props;
    return (
    <div>
      <Row>
        <Col xs={12} md={6}>
          <Input
            id="proposal-sorting"
            type="select"
            onChange={(e) => { dispatch(changeOrder(e.target.value)); }}
            value={order}
          >
            {
              this.state.displayedOrders.map((choice) => {
                return (
                  <option key={choice} value={choice}>
                    {this.getIntlMessage(`global.filter_f_${choice}`)}
                  </option>
                );
              })
            }
          </Input>
        </Col>
        <Col xs={12} md={6}>
          <ProposalListSearch />
        </Col>
      </Row>
      <Row>
        {
          this.state.displayedFilters.filter((filterName) => filters[filterName]).map((filterName, index) => {
            return (
              <Col xs={12} md={6} key={index}>
                <Input
                  type="select"
                  id={`proposal-filter-${filterName}`}
                  onChange={(e) => { dispatch(changeFilter(filterName, e)); }}
                  value={filters[filterName] || 0}
                >
                  <option value="0">
                    {this.getIntlMessage(`global.select_${filterName}`)}
                  </option>
                  {
                    filters[filterName].map((choice) => {
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
  return {
    features: state.default.features,
    order: state.proposal.order,
    filters: state.proposal.filters,
    districts: state.default.districts,
    statuses: [],
  };
};

export default connect(mapStateToProps, null, null, { pure: false })(ProposalListFilters);
