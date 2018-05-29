import React, { PropTypes } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { State } from '../../../types';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import ProposalListOrderSorting from './ProposalListOrderSorting';

import { changeFilter, changeProposalListView } from '../../../redux/modules/proposal';
import ToggleMapButton from './../Map/ToggleMapButton';

export const ProposalListFilters = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    statuses: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    orderByVotes: PropTypes.bool,
    orderByComments: PropTypes.bool,
    orderByCost: PropTypes.bool,
    defaultSort: PropTypes.string,
    features: PropTypes.object.isRequired,
    showThemes: PropTypes.bool.isRequired,
    filters: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    showDistrictFilter: PropTypes.bool.isRequired,
    showCategoriesFilter: PropTypes.bool.isRequired,
    showToggleMapButton: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      orderByVotes: false,
      orderByComments: false,
      orderByCost: false,
      showToggleMapButton: false,
    };
  },

  getInitialState() {
    const {
      categories,
      features,
      showThemes,
      statuses,
      districts,
      themes,
      types,
      showDistrictFilter,
      showCategoriesFilter,
    } = this.props;

    return {
      displayedFilters: []
        .concat(features.user_type && types.length > 0 ? ['types'] : [])
        .concat(
          features.districts && districts.length > 0 && showDistrictFilter ? ['districts'] : [],
        )
        .concat(features.themes && showThemes && themes.length > 0 ? ['themes'] : [])
        .concat(showCategoriesFilter && categories.length > 1 ? ['categories'] : [])
        .concat(statuses.length > 0 ? ['statuses'] : []),
    };
  },

  render() {
    const {
      dispatch,
      filters,
      orderByComments,
      orderByCost,
      orderByVotes,
      showToggleMapButton,
      defaultSort,
      intl,
    } = this.props;
    const { displayedFilters } = this.state;

    return (
      <div className="mb-15 mt-30">
        <Row>
          {showToggleMapButton && (
            <Col xs={12} sm={6} md={4} lg={3} xsHidden smHidden>
              <ToggleMapButton
                onChange={mode => {
                  dispatch(changeProposalListView(mode));
                }}
              />
            </Col>
          )}
          <Col xs={12} sm={6} md={4} lg={3}>
            <ProposalListSearch />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <ProposalListOrderSorting
              orderByCost={orderByCost}
              orderByComments={orderByComments}
              orderByVotes={orderByVotes}
              defaultSort={defaultSort}
            />
          </Col>
          {displayedFilters.map((filterName, index) => (
            <Col xs={12} sm={6} md={4} lg={3} key={index}>
              <Input
                type="select"
                aria-label={intl.formatMessage({ id: 'global.searchIn' }, { filterName })}
                id={`proposal-filter-${filterName}`}
                onChange={e => {
                  dispatch(changeFilter(filterName, e.target.value));
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

const container = injectIntl(ProposalListFilters);

export default connect(mapStateToProps)(container);
