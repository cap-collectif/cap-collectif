// @flow
import React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { graphql } from 'relay-runtime';
import { Field, formValueSelector, reset } from 'redux-form';
import { createFragmentContainer } from 'react-relay';
import select from '../../Form/Select';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import config from '../../../config';
import component from '../../Form/Field';
import { changeEventMobileListView } from '../../../redux/modules/event';
import EventListToggleMobileViewBtn from './EventListToggleMobileViewBtn';
import FiltersContainer from '../../Filters/FiltersContainer';
import EventListCounter from './EventListCounter';
import EventListStatusFilter from './EventListStatusFilter';
import UserListField from '../../Admin/Field/UserListField';
import type { EventListFilters_query } from '~relay/EventListFilters_query.graphql';
import SelectTheme from '../../Utils/SelectTheme';
import SelectProject from '../../Utils/SelectProject';
import type { EventOrder } from '~relay/HomePageEventsQuery.graphql';

type Registrable = 'all' | 'yes' | 'no';

type Props = {|
  ...ReduxFormFormProps,
  query: EventListFilters_query,
  features: FeatureToggles,
  dispatch: Dispatch,
  theme: ?string,
  isRegistrable: ?Registrable,
  orderBy: EventOrder,
  project: ?string,
  userType: ?string,
  search: ?string,
  author: ?string,
  intl: IntlShape,
  addToggleViewButton: ?boolean,
  userTypes: Array<Object>,
|};

const countFilters = (
  theme: ?string,
  project: ?string,
  search: ?string,
  author: ?string,
  userType: ?string,
  isRegistrable: ?Registrable,
): number => {
  let nbFilter = 0;
  if (author) {
    nbFilter++;
  }
  if (theme) {
    nbFilter++;
  }
  if (project) {
    nbFilter++;
  }
  if (userType) {
    nbFilter++;
  }
  if (isRegistrable) {
    nbFilter++;
  }

  if (config.isMobile && search) {
    nbFilter++;
  }

  return nbFilter;
};
const StatusContainer = styled(Col)`
  color: white;
  display: flex;
  align-items: center;
`;
const FiltersWrapper = styled(Col)`
  @media screen and (max-width: 991px) {
    display: flex;
    justify-content: space-between;
  }
`;

export class EventListFilters extends React.Component<Props> {
  getFilters(nbFilter: number): [] {
    const { features, theme, project, userTypes, intl, dispatch, query } = this.props;
    const filters = [];
    filters.push(
      <Field
        component={select}
        id="EventListFilters-filter-isRegistrable"
        name="isRegistrable"
        placeholder={intl.formatMessage({ id: 'indifferent' })}
        label={intl.formatMessage({ id: 'registration-required' })}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        clearable
        aria-controls="EventListFilters-filter-isRegistrable-listbox"
        options={[
          { value: 'all', label: intl.formatMessage({ id: 'indifferent' }) },
          { value: 'yes', label: intl.formatMessage({ id: 'global.yes' }) },
          { value: 'no', label: intl.formatMessage({ id: 'global.no' }) },
        ]}
      />,
    );
    filters.push(
      <UserListField
        id="EventListFilters-filter-authors"
        name="author"
        authorOfEvent
        clearable
        selectFieldIsObject
        debounce
        autoload={false}
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        placeholder={intl.formatMessage({ id: 'all-the-authors' })}
        label={<FormattedMessage id="project_download.label.author" />}
        ariaControls="EventListFilters-filter-author-listbox"
      />,
    );
    filters.push(
      <div className="visible-xs-block visible-sm-block">
        <Field
          clearable
          id="event-search-input"
          name="search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="event-search-input-listbox"
          addonAfter={<i className="cap cap-magnifier" />}
          component={component}
          placeholder={intl.formatMessage({ id: 'proposal-search' })}
          label={intl.formatMessage({ id: 'proposal-search' })}
          groupClassName="event-search-group pull-right"
        />
      </div>,
    );
    if (features.themes && query) {
      filters.push(
        <div>
          <SelectTheme query={query} />
        </div>,
      );
    }
    if (features.projects_form && query) {
      filters.push(
        <div>
          <SelectProject query={query} />
        </div>,
      );
    }

    if (userTypes.length) {
      filters.push(
        <Field
          component={select}
          name="userType"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          id="EventListFilters-filter-userType"
          aria-controls="EventListFilters-filter-userType-listbox"
          placeholder={intl.formatMessage({ id: 'global.select_project_types' })}
          label={intl.formatMessage({ id: 'filter-userType' })}
          options={userTypes.map(u => ({ value: u.id, label: u.name }))}
        />,
      );
    }

    if ((theme !== null || project !== null) && nbFilter > 0) {
      filters.push(
        <Button
          bsStyle="link"
          className="p-0"
          onClick={() => dispatch(reset('EventPageContainer'))}>
          <FormattedMessage id="reset-filters" />
        </Button>,
      );
    }

    return filters;
  }

  getPopoverBottom(nbFilters: number) {
    const filters = this.getFilters(nbFilters);

    return (
      <div>
        <form>
          {filters.map((filter, index) => (
            <Col key={index} className="mt-5">
              <div>{filter}</div>
            </Col>
          ))}
        </form>
      </div>
    );
  }

  render() {
    const {
      features,
      theme,
      project,
      search,
      author,
      isRegistrable,
      userType,
      intl,
      addToggleViewButton,
      dispatch,
      query,
    } = this.props;

    const nbFilter = countFilters(theme, project, search, author, userType, isRegistrable);

    const popoverBottom = this.getPopoverBottom(nbFilter);

    const filterCount = () => {
      if (nbFilter > 0) {
        return nbFilter;
      }
    };

    return (
      <Row className="align-items-center d-flex flex-wrap">
        <StatusContainer xs={4} md={5} xsHidden smHidden>
          <EventListCounter query={query} />
          <EventListStatusFilter screen="desktop" />
        </StatusContainer>
        <FiltersWrapper xs={12} md={4} id="event-filters">
          <div className="pull-right">
            <FiltersContainer type="event" overlay={popoverBottom} filterCount={filterCount()} />
          </div>
          {addToggleViewButton && features.display_map ? (
            <EventListToggleMobileViewBtn
              showMapButton
              isMobileListView
              onChange={isListView => {
                dispatch(changeEventMobileListView(isListView));
              }}
            />
          ) : null}
        </FiltersWrapper>
        <Col xs={4} md={3} xsHidden smHidden>
          <form
            onSubmit={e => {
              e.preventDefault();
              return false;
            }}>
            <Field
              id="event-search-input"
              name="search"
              type="text"
              component={component}
              placeholder={intl.formatMessage({ id: 'proposal-search' })}
              addonAfter={<i className="cap cap-magnifier" />}
              divClassName="event-search-group pull-right w-100"
            />
          </form>
        </Col>
      </Row>
    );
  }
}

const selector = formValueSelector('EventPageContainer');

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  theme: selector(state, 'theme'),
  project: selector(state, 'project'),
  search: selector(state, 'search'),
  userType: selector(state, 'userType'),
  userTypes: state.default.userTypes,
  author: selector(state, 'author'),
  isRegistrable: selector(state, 'isRegistrable'),
  orderBy: selector(state, 'orderBy'),
});

const container = connect(mapStateToProps)(injectIntl(EventListFilters));

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventListFilters_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        project: { type: "ID" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
        author: { type: "ID" }
        isRegistrable: { type: "Boolean" }
        orderBy: { type: "EventOrder" }
      ) {
      ...EventListCounter_query
        @arguments(
          cursor: $cursor
          count: $count
          search: $search
          theme: $theme
          project: $project
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        )
      ...SelectTheme_query
      ...SelectProject_query @arguments(withEventOnly: true)
    }
  `,
});
