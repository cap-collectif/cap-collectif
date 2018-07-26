// @flow
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import type { GlobalState, Dispatch } from '../../../types';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';
import ProposalListOrderSorting from './ProposalListOrderSorting';
import { changeFilter, changeProposalListView } from '../../../redux/modules/proposal';
import ToggleMapButton from './../Map/ToggleMapButton';
import type { ProposalListFilters_step } from './__generated__/ProposalListFilters_step.graphql';

type Props = {
  themes: Array<$FlowFixMe>,
  step: ProposalListFilters_step,
  types: Array<$FlowFixMe>,
  districts: Array<$FlowFixMe>,
  statuses: Array<$FlowFixMe>,
  categories: Array<$FlowFixMe>,
  orderByVotes?: boolean,
  orderByComments?: boolean,
  orderByCost?: boolean,
  defaultSort?: string,
  features: Object,
  showThemes: boolean,
  filters: Object,
  dispatch: Dispatch,
  showDistrictFilter: boolean,
  showCategoriesFilter: boolean,
  showToggleMapButton?: boolean,
  intl: Object,
};

type State = {
  displayedFilters: Array<$FlowFixMe>,
};

export class ProposalListFilters extends React.Component<Props, State> {
  static defaultProps = {
    orderByVotes: false,
    orderByComments: false,
    orderByCost: false,
    showToggleMapButton: false,
  };

  constructor(props: Props) {
    super(props);
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
    } = props;

    this.state = {
      displayedFilters: []
        .concat(features.user_type && types.length > 0 ? ['types'] : [])
        .concat(
          features.districts && districts.length > 0 && showDistrictFilter ? ['districts'] : [],
        )
        .concat(features.themes && showThemes && themes.length > 0 ? ['themes'] : [])
        .concat(showCategoriesFilter && categories.length > 1 ? ['categories'] : [])
        .concat(statuses.length > 0 ? ['statuses'] : []),
    };
  }

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
      step,
    } = this.props;
    const { displayedFilters } = this.state;

    // TO update for prod values, and delete after
    const isMontreuil =
      window.location.href ===
      'https://budgetparticipatif.montreuil.fr/project/budget-participatif-2017/selection/vote-par-quartier-2';
    const defaultDistrictId = '51dad909-6e3e-11e8-a324-0242ac110005';

    return (
      <div className="mb-15 mt-30">
        <Row>
          {showToggleMapButton && (
            <Col xs={12} sm={6} md={4} lg={3}>
              <ToggleMapButton
                step={step}
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
                value={
                  filters[filterName] ||
                  (isMontreuil && filterName === 'districts' ? defaultDistrictId : 0)
                }>
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
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  features: state.default.features,
  themes: state.default.themes,
  types: state.default.userTypes,
  filters: state.proposal.filters || {},
});

const container = injectIntl(ProposalListFilters);

const connector = connect(mapStateToProps)(container);

export default createFragmentContainer(connector, {
  step: graphql`
    fragment ProposalListFilters_step on ProposalStep {
      id
      ...ToggleMapButton_step
    }
  `,
});
