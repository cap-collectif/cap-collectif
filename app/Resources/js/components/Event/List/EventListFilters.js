// @flow
import React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
import { reduxForm, Field, formValueSelector, type FormProps } from 'redux-form';
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
import type { EventListFilters_query } from './__generated__/EventListFilters_query.graphql';

type State = { projectOptions: Array<Object>, themeOptions: Array<Object> };
type Props = {|
  ...FormProps,
  query: EventListFilters_query,
  features: FeatureToggles,
  dispatch: Dispatch,
  theme: ?string,
  project: ?string,
  search: ?string,
  intl: IntlShape,
  addToggleViewButton: ?boolean,
  userTypes: Array<Object>,
|};

const countFilters = (theme: ?string, project: ?string, search: ?string): number => {
  let nbFilter = 0;
  if (theme) {
    nbFilter++;
  }
  if (project) {
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
    const { features, theme, project, reset, userTypes, intl } = this.props;
    const { themeOptions, projectOptions } = this.state;

    const filters = [];

    if (theme !== null || project !== null) {
      if (nbFilter > 0) {
        filters.push(
          <div className="d-flex justify-content-end">
            <Button className="btn--outline btn-dark-gray" onClick={reset}>
              <FormattedMessage id="reset-filters" />
            </Button>
          </div>,
        );
      }
    }

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

    filters.push(
      <Field
        component={select}
        id="EventListFilters-filter-status"
        name="status"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        aria-controls="EventListFilters-filter-status-listbox"
        clearable={false}
        placeholder={intl.formatMessage({ id: 'voting-status' })}
        options={[
          {
            value: 'all',
            label: intl.formatMessage({
              id: 'all-events',
            }),
          },
          {
            value: 'ongoing-and-future',
            label: intl.formatMessage({
              id: 'ongoing-and-future',
            }),
          },
          { value: 'finished', label: intl.formatMessage({ id: 'finished' }) },
        ]}
      />,
    );

    if (config.isMobile) {
      filters.push(
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
      intl,
      addToggleViewButton,
      dispatch,
      query,
    } = this.props;

    const nbFilter = countFilters(theme, project, search);

    const popoverBottom = this.getPopoverBottom(nbFilter);

    const filterCount = () => {
      if (nbFilter > 0) {
        return nbFilter;
      }
    };
    return (
      <Row className={config.isMobile ? 'mb-10 ml-0' : 'mb-10'}>
        <Col xs={12} md={4} className="pl-0">
          {/* $FlowFixMe $refType */}
          <EventListCounter query={query} />
        </Col>
        <Col xs={12} md={4} className="pl-0" id="event-filters">
          <div className="pull-right">
            <FiltersContainer type="event" overlay={popoverBottom} filterCount={filterCount()} />
          </div>
          {config.isMobile && addToggleViewButton && features.display_map ? (
            <EventListToggleMobileViewBtn
              showMapButton
              isMobileListView
              onChange={isListView => {
                dispatch(changeEventMobileListView(isListView));
              }}
            />
          ) : null}
        </Col>
        <Col md={4} smHidden xsHidden>
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

const selector = formValueSelector('EventListFilters');

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  theme: selector(state, 'theme'),
  project: selector(state, 'project'),
  search: selector(state, 'search'),
  userType: selector(state, 'userType'),
  userTypes: state.default.userTypes,
});

const form = reduxForm({
  form: 'EventListFilters',
  destroyOnUnmount: false,
  initialValues: {
    status: 'all',
  },
})(EventListFilters);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
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
);
