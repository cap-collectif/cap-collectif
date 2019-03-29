// @flow
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import ProposalListSearch from './ProposalListSearch';
import Input from '../../Form/Input';
import ProposalListOrderSorting from './ProposalListOrderSorting';
import { changeFilter, changeProposalListView } from '../../../redux/modules/proposal';
import ProposalListToggleViewBtn from './ProposalListToggleViewBtn';
import type { ProposalListFilters_step } from './__generated__/ProposalListFilters_step.graphql';

type Props = {|
  step: ProposalListFilters_step,
  features: FeatureToggles,
  dispatch: Dispatch,
  filters: Object,
  types: Array<Object>,
  themes: Array<Object>,
  intl: IntlShape,
|};

export class ProposalListFilters extends React.Component<Props> {
  render() {
    const { dispatch, features, intl, step, filters } = this.props;

    const { form } = step;

    const options = {
      types: this.props.types,
      categories: form.categories,
      districts: form.districts,
      themes: this.props.themes,
      statuses: step.statuses,
    };

    const displayedFilters = []
      .concat(features.user_type && options.types.length > 0 ? ['types'] : [])
      .concat(
        features.districts && options.districts.length > 0 && form.usingDistrict
          ? ['districts']
          : [],
      )
      .concat(features.themes && form.usingThemes && options.themes.length > 0 ? ['themes'] : [])
      .concat(form.usingCategories && options.categories.length > 1 ? ['categories'] : [])
      .concat(options.statuses.length > 0 ? ['statuses'] : []);

    const orderByVotes = step.voteType !== 'DISABLED';
    const orderByComments = form.commentable;
    const orderByCost = form.costable;
    const showMapButton = form.usingAddress && !step.private && features.display_map;

    return (
      <div className="mb-15 mt-30">
        <Row>
          <Col xs={12} sm={6} md={4} lg={3}>
            <ProposalListToggleViewBtn
              showMapButton={showMapButton}
              onChange={mode => {
                dispatch(changeProposalListView(mode));
              }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            {/* $FlowFixMe please use mapDispatchToProps */}
            <ProposalListSearch />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            {/* $FlowFixMe please use mapDispatchToProps */}
            <ProposalListOrderSorting
              orderByCost={orderByCost}
              orderByComments={orderByComments}
              orderByVotes={orderByVotes}
              defaultSort={step.defaultSort}
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
                value={filters[filterName]}>
                <FormattedMessage id={`global.select_${filterName}`}>
                  {(message: string) => <option value="0">{message}</option>}
                </FormattedMessage>
                {options[filterName].map(choice => (
                  <option key={choice.id} value={choice.id}>
                    {choice.title || choice.name}
                  </option>
                ))}
              </Input>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  themes: state.default.themes,
  types: state.default.userTypes,
  filters: state.proposal.filters || {},
});

const withIntl = injectIntl(ProposalListFilters);

const container = connect(mapStateToProps)(withIntl);

export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalListFilters_step on ProposalStep {
      id
      ... on CollectStep {
        private
      }
      defaultSort
      voteType
      statuses {
        id
        name
      }
      form {
        latMap
        lngMap
        zoomMap
        usingDistrict
        usingAddress
        usingThemes
        commentable
        costable
        usingCategories
        districts(order: ALPHABETICAL) {
          id
          name
        }
        categories(order: ALPHABETICAL) {
          id
          name
        }
      }
    }
  `,
});
