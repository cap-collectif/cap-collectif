import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { State } from '../../../types';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import {
  changeFilter,
  changeOrder,
  loadProposals,
  changeProposalListView,
} from '../../../redux/modules/proposal';
import ToggleMapButton from './../Map/ToggleMapButton';

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
    showDistrictFilter: PropTypes.bool.isRequired,
    showToggleMapButton: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      orderByVotes: false,
      showToggleMapButton: false,
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
      showDistrictFilter,
    } = this.props;
    return {
      displayedFilters: []
        .concat(types.length > 0 ? ['types'] : [])
        .concat(
          features.districts && districts.length > 0 && showDistrictFilter
            ? ['districts']
            : [],
        )
        .concat(
          features.themes && showThemes && themes.length > 0 ? ['themes'] : [],
        )
        .concat(categories.length > 0 ? ['categories'] : [])
        .concat(statuses.length > 0 ? ['statuses'] : []),
      displayedOrders: ['random', 'last', 'old', 'comments'].concat(
        orderByVotes ? ['votes'] : [],
      ),
    };
  },

  render() {
    const { order, dispatch, filters, showToggleMapButton } = this.props;
    const { displayedFilters, displayedOrders } = this.state;

    const colWidth = showToggleMapButton ? 4 : 6;

    return (
      <div>
        <Row>
          <Col xs={12} md={colWidth}>
            <Input
              id="proposal-sorting"
              type="select"
              onChange={e => {
                dispatch(changeOrder(e.target.value));
                dispatch(loadProposals());
              }}
              value={order}>
              {displayedOrders.map(choice => (
                <option key={choice} value={choice}>
                  {this.getIntlMessage(`global.filter_f_${choice}`)}
                </option>
              ))})
              }
            </Input>
          </Col>
          <Col xs={12} md={colWidth}>
            <ProposalListSearch />
          </Col>
          {showToggleMapButton &&
            <Col xs={12} md={colWidth} xsHidden smHidden>
              <ToggleMapButton
                onChange={mode => {
                  dispatch(changeProposalListView(mode));
                }}
              />
            </Col>}
        </Row>
        <Row>
          {displayedFilters.map((filterName, index) => (
            <Col xs={12} md={colWidth} key={index}>
              <Input
                type="select"
                id={`proposal-filter-${filterName}`}
                onChange={e => {
                  dispatch(changeFilter(filterName, e.target.value));
                  dispatch(loadProposals());
                }}
                value={filters[filterName] || 0}>
                <option value="0">
                  {this.getIntlMessage(`global.select_${filterName}`)}
                </option>
                {this.props[filterName].map(choice => {
                  return (
                    <option key={choice.id} value={choice.id}>
                      {choice.title || choice.name}
                    </option>
                  );
                })}
              </Input>
            </Col>
          ))}
        </Row>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => {
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
