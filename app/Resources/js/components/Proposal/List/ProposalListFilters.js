import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { State } from '../../../types';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import ProposalListOrderSorting from './ProposalListOrderSorting';
import { PROPOSAL_AVAILABLE_ORDERS } from '../../../constants/ProposalConstants';

import {
  changeFilter,
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
    defaultSort: PropTypes.string,
    features: PropTypes.object.isRequired,
    showThemes: PropTypes.bool.isRequired,
    filters: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    showDistrictFilter: PropTypes.bool.isRequired,
    showCategoriesFilter: PropTypes.bool.isRequired,
    showToggleMapButton: PropTypes.bool,
  },

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
      statuses,
      districts,
      themes,
      types,
      showDistrictFilter,
      showCategoriesFilter,
    } = this.props;

    return {
      displayedFilters: []
        .concat(types.length > 0 ? ['types'] : [])
        .concat(
          features.districts && districts.length > 0 && showDistrictFilter ? ['districts'] : [],
        )
        .concat(features.themes && showThemes && themes.length > 0 ? ['themes'] : [])
        .concat(showCategoriesFilter && categories.length > 1 ? ['categories'] : [])
        .concat(features.user_type && statuses.length > 0 ? ['statuses'] : []),
      displayedOrders: PROPOSAL_AVAILABLE_ORDERS.concat(orderByVotes ? ['votes'] : []),
    };
  },

  render() {
    const { dispatch, filters, showToggleMapButton, defaultSort } = this.props;
    const { displayedFilters, orderByVotes } = this.state;
    const colWidth = showToggleMapButton ? 4 : 6;

    return (
      <div className="mb-15">
        <Row>
          <Col xs={12} md={colWidth}>
            <ProposalListOrderSorting orderByVotes={orderByVotes} defaultSort={defaultSort} />
          </Col>
          <Col xs={12} md={colWidth}>
            <ProposalListSearch />
          </Col>
          {showToggleMapButton && (
            <Col xs={12} md={colWidth} xsHidden smHidden>
              <ToggleMapButton
                onChange={mode => {
                  dispatch(changeProposalListView(mode));
                }}
              />
            </Col>
          )}
        </Row>
        <Row>
          {displayedFilters.map((filterName, index) => (
            <Col xs={12} md={colWidth} key={index}>
              <Input
                type="select"
                id={`proposal-filter-${filterName}`}
                onChange={e => {
                  dispatch(changeFilter(filterName, e.target.value));
                  dispatch(loadProposals(null, true));
                }}
                value={filters[filterName] || 0}>
                <FormattedMessage id={`global.select_${filterName}`}>
                  {message => <option value="0">{message}</option>}
                </FormattedMessage>
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
    filters: state.proposal.filters || {},
  };
};

export default connect(mapStateToProps)(ProposalListFilters);
