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
    const {
      categories,
      features,
      showThemes,
      orderByVotes,
      districts,
      statuses,
      themes,
      types,
    } = this.props;
    return {
      displayedFilters: []
        .concat(types.length > 0 ? ['types'] : [])
        .concat(features.districts && districts.length > 0 ? ['districts'] : [])
        .concat(features.themes && showThemes && themes.length > 0 ? ['themes'] : [])
        .concat(categories.length > 0 ? ['categories'] : [])
        .concat(statuses.length > 0 ? ['statuses'] : []),
      displayedOrders: ['random', 'last', 'old', 'comments'].concat(orderByVotes ? ['votes'] : []),
    };
  },

  render() {
    const {
      order,
      dispatch,
      filters,
    } = this.props;
    const { displayedFilters, displayedOrders } = this.state;
    return (
    <div>
      <Row>
        <Col xs={12} md={6}>
          <Input
            id="proposal-sorting"
            type="select"
            onChange={(e) => {
              dispatch(changeOrder(e.target.value));
              dispatch(loadProposals());
            }}
            value={order}
          >
            {
              displayedOrders.map(choice =>
                  <option key={choice} value={choice}>
                    {this.getIntlMessage(`global.filter_f_${choice}`)}
                  </option>
                )
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
          displayedFilters.map((filterName, index) =>
              <Col xs={12} md={6} key={index}>
                <Input
                  type="select"
                  id={`proposal-filter-${filterName}`}
                  onChange={(e) => {
                    dispatch(changeFilter(filterName, e.target.value));
                    dispatch(loadProposals());
                  }}
                  value={filters[filterName] || 0}
                >
                  <option value="0">
                    {this.getIntlMessage(`global.select_${filterName}`)}
                  </option>
                  {
                    this.props[filterName].map(choice =>
                        <option key={choice.id} value={choice.id}>
                          {choice.title || choice.name}
                        </option>
                      )
                    })
                  }
                </Input>
              </Col>
          )
        }
      </Row>
    </div>
    );
  },
});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    themes: state.default.themes,
    types: state.default.userTypes,
    districts: state.default.districts,
    order: state.proposal.order,
    filters: state.proposal.filters || {},
  };
};

export default connect(mapStateToProps)(ProposalListFilters);
