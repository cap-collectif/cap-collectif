// @flow
import React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
import { Field, formValueSelector, type FormProps, reset } from 'redux-form';
import { createFragmentContainer } from 'react-relay';
import select from '../../Form/Select';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import config from '../../../config';
import component from '../../Form/Field';
import { changeEventMobileListView } from '../../../redux/modules/event';
import EventListToggleMobileViewBtn from './EventListToggleMobileViewBtn';
import FiltersContainer from '../../Filters/FiltersContainer';
import environment from '../../../createRelayEnvironment';
import EventListCounter from './EventListCounter';
import EventListStatusFilter from './EventListStatusFilter';
import type { EventListFilters_query } from '~relay/EventListFilters_query.graphql';

type State = { projectOptions: Array<Object>, themeOptions: Array<Object> };
type Props = {|
  ...FormProps,
  query: EventListFilters_query,
  features: FeatureToggles,
  dispatch: Dispatch,
  theme: ?string,
  project: ?string,
  userType: ?string,
  search: ?string,
  intl: IntlShape,
  addToggleViewButton: ?boolean,
  userTypes: Array<Object>,
|};

const countFilters = (
  theme: ?string,
  project: ?string,
  search: ?string,
  userType: ?string,
): number => {
  let nbFilter = 0;
  if (theme) {
    nbFilter++;
  }
  if (project) {
    nbFilter++;
  }
  if (userType) {
    nbFilter++;
  }

  if (config.isMobile && search) {
    nbFilter++;
  }

  return nbFilter;
};

const projectQuery = graphql`
  query EventListFiltersQuery($withEventOnly: Boolean) {
    projects(withEventOnly: $withEventOnly) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

const themeQuery = graphql`
  query EventListFiltersThemeQuery {
    themes {
      id
      title
    }
  }
`;

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

export class EventListFilters extends React.Component<Props, State> {
  state = { projectOptions: [], themeOptions: [] };

  componentDidMount() {
    fetchQuery(environment, projectQuery, { withEventOnly: true })
      .then(res =>
        res.projects.edges.map(edge => ({
          value: edge.node.id,
          label: edge.node.title,
        })),
      )
      .then(projectOptions => {
        this.setState({ projectOptions });
      });
    fetchQuery(environment, themeQuery)
      .then(res => res.themes.map(theme => ({ value: theme.id, label: theme.title })))
      .then(themeOptions => {
        this.setState({ themeOptions });
      });
  }

  getFilters(nbFilter: number): [] {
    const { features, theme, project, userTypes, intl, dispatch } = this.props;
    const { themeOptions, projectOptions } = this.state;

    const filters = [];

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
          groupClassName="event-search-group pull-right"
        />
      </div>,
    );

    if (features.themes && themeOptions.length) {
      filters.push(
        <Field
          component={select}
          id="EventListFilters-filter-theme"
          name="theme"
          placeholder={intl.formatMessage({ id: 'type-theme' })}
          options={themeOptions}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="EventListFilters-filter-theme-listbox"
        />,
      );
    }
    if (features.projects_form && projectOptions.length) {
      filters.push(
        <Field
          component={select}
          id="EventListFilters-filter-project"
          name="project"
          placeholder={intl.formatMessage({ id: 'type-project' })}
          options={projectOptions}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="EventListFilters-filter-project-listbox"
        />,
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
          placeholder={intl.formatMessage({ id: 'filter-userType' })}
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
        <p>
          <b>
            <FormattedMessage id="filter-by" />
          </b>
        </p>
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
      userType,
      intl,
      addToggleViewButton,
      dispatch,
      query,
    } = this.props;

    const nbFilter = countFilters(theme, project, search, userType);

    const popoverBottom = this.getPopoverBottom(nbFilter);

    const filterCount = () => {
      if (nbFilter > 0) {
        return nbFilter;
      }
    };

    return (
      <Row className="align-items-center d-flex flex-wrap">
        <StatusContainer xs={4} md={5} xsHidden smHidden>
          {/* $FlowFixMe $refType */}
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
        )
    }
  `,
});
