// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { fetchQuery } from 'relay-runtime';
import { createFragmentContainer, graphql } from 'react-relay';
import { type FormProps, Field, reduxForm } from 'redux-form';
import component from '../../Form/Field';
import type { Dispatch, FeatureToggles, GlobalState } from '../../../types';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';
import type { EventListFiltersThemeQueryResponse } from '~relay/EventListFiltersThemeQuery.graphql';
import type { EventForm_event } from '~relay/EventForm_event.graphql';
import UserListField from '../../Admin/Field/UserListField';

type State = {|
  themeOptions: Array<any>,
|};

type Props = {|
  ...FormProps,
  event: ?EventForm_event,
  projects: {},
  features: FeatureToggles,
  dispatch: Dispatch,
  theme: ?string,
  intl: IntlShape,
  isAdmin: boolean,
  initialValues?: ?{},
  autoload: boolean,
  fieldName: string,
  multi: boolean,
  initialValues?: ?{},
  onSubmit: (e: Event) => void,
  validate: (e: Event) => void,
|};

export const formName = 'EventForm';

const themeQuery = graphql`
  query EventFormThemeQuery {
    themes {
      id
      title
    }
  }
`;

export class EventForm extends React.Component<Props, State> {
  state = { themeOptions: [] };

  componentDidMount() {
    fetchQuery(environment, themeQuery)
      .then((res: EventListFiltersThemeQueryResponse) =>
        res.themes.map(theme => ({ value: theme.id, label: theme.title })),
      )
      .then(themeOptions => {
        this.setState({ themeOptions });
      });
  }

  render() {
    const { features, intl, projects, isAdmin, event } = this.props;
    const { themeOptions } = this.state;
    return (
      <form>
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.admin.general" />
          </h3>
        </div>
        <div className="box-body">
          <Field
            name="title"
            label={
              <span>
                <FormattedMessage id="admin.fields.group.title" />
                <span className="excerpt">
                  <FormattedMessage id="global.mandatory" />
                </span>
              </span>
            }
            component={component}
            type="text"
            id="event_title"
          />
          {isAdmin && (
            <UserListField
              clearable={false}
              label={
                <span>
                  <FormattedMessage id="admin.fields.argument_vote.voter" />
                  <span className="excerpt">
                    <FormattedMessage id="global.mandatory" />
                  </span>
                </span>
              }
              ariaControls="EventForm-filter-user-listbox"
              inputClassName="fake-inputClassName"
              autoload
              disabled={!isAdmin}
              id="event_author"
              name="author"
              placeholder={null}
              labelClassName={null}
            />
          )}
          <Field
            id="event_address"
            component={component}
            type="address"
            name="address"
            formName={formName}
            label={<FormattedMessage id="admin.fields.proposal.address" />}
            placeholder="proposal.map.form.placeholder"
          />
          <Field
            id="event_body"
            type="editor"
            name="body"
            component={component}
            label={
              <span>
                <FormattedMessage id="admin.fields.proposal_form.description" />
                <span className="excerpt">
                  <FormattedMessage id="global.mandatory" />
                </span>
              </span>
            }
          />
          <Field
            id="event_startAt"
            component={component}
            type="datetime"
            name="startAt"
            formName={formName}
            label={
              <span>
                <FormattedMessage id="start-date" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.mandatory" />
                </span>
              </span>
            }
          />
          <Field
            id="event_endAt"
            component={component}
            type="datetime"
            name="endAt"
            formName={formName}
            label={<FormattedMessage id="ending-date" />}
          />
          <Field
            id="event_media"
            name="media"
            label={<FormattedMessage id="admin.fields.proposal.media" />}
            component={component}
            type="image"
          />
        </div>
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="form.label_category" />
          </h3>
        </div>
        {features.themes && themeOptions && themeOptions.length && (
          <Field
            component={select}
            id="EventForm-filter-theme"
            name="theme"
            placeholder={intl.formatMessage({ id: 'project.searchform.all_themes' })}
            label={intl.formatMessage({ id: 'type-theme' })}
            options={themeOptions}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            aria-controls="EventForm-filter-theme-listbox"
          />
        )}
        <Field
          component={select}
          clearable
          id="event_project"
          name="projects"
          multi
          placeholder={intl.formatMessage({ id: 'type-project' })}
          options={Object.keys(projects)
            .map(key => projects[key])
            .map(p => ({ value: p.id, label: p.title }))
            .concat(
              event && event.projects
                ? event.projects.map(p => ({
                    value: p.id,
                    label: p.title,
                  }))
                : {},
            )}
        />
        <div>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="proposal_form.admin.settings.options" />
            </h3>
          </div>
          <div className="box-body ml-10">
            <Field
              name="guestListEnabled"
              id="event_registrable"
              type="checkbox"
              component={component}
              children={<FormattedMessage id="authorize-registration" />}
            />
            <Field
              name="commentable"
              id="event_commentable"
              type="checkbox"
              component={component}
              children={<FormattedMessage id="admin.fields.blog_post.is_commentable" />}
            />
          </div>
          {isAdmin && (
            <div>
              <div className="box-header">
                <h3 className="box-title">
                  <FormattedMessage id="admin.fields.page.advanced" />
                </h3>
              </div>
              {/* // TODO look at component dev by jean */}
              <Field
                name="customCode"
                id="event_custom_code"
                type="text"
                component={component}
                label={<FormattedMessage id="event.metadescription" />}
                help={<FormattedMessage id="admin.help.metadescription" />}
              />
              <Field
                name="metaDescription"
                id="event_meta_description"
                type="textarea"
                component={component}
                label={<FormattedMessage id="event.customcode" />}
                help={<FormattedMessage id="admin.help.customcode" />}
              />
              <div className="box-header">
                <h3 className="box-title">
                  <FormattedMessage id="admin.fields.project.published_at" />
                </h3>
              </div>
              <div className="box-body ml-10">
                <Field
                  name="enabled"
                  id="event_enabled"
                  type="checkbox"
                  component={component}
                  children={<FormattedMessage id="proposal.state.published" />}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    );
  }
}

const formContainer = reduxForm({
  form: formName,
})(EventForm);

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (props.event) {
    return {
      isAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_ADMIN')),
      features: state.default.features,
      themes: state.default.themes,
      projects: state.project.projectsById,
      initialValues: {
        id: props.event && props.event.id ? props.event.id : null,
        title: props.event && props.event.title ? props.event.title : null,
        startAt: props.event && props.event.timeRange ? props.event.timeRange.startAt : null,
        endAt: props.event && props.event.timeRange ? props.event.timeRange.endAt : null,
        body: props.event ? props.event.body : null,
        enabled: props.event ? props.event.enabled : null,
        commentable: props.event ? props.event.commentable : null,
        guestListEnabled: props.event ? props.event.guestListEnabled : null,
        metaDescription: props.event ? props.event.metaDescription : null,
        customCode: props.event ? props.event.customCode : null,
        media: props.event ? props.event.media : null,
        projects: props.event
          ? props.event.projects.map(p => ({
              value: p.id,
              label: p.title,
            }))
          : null,
        themes: props.event
          ? props.event.themes.map(th => ({
              value: th.id,
              label: th.title,
            }))
          : null,
        author: props.event && props.event.author ? props.event.author.id : null,
        address:
          props.event && props.event.addressJson
            ? JSON.parse(props.event.addressJson)[0].formatted_address
            : null,
      },
    };
  }
  return {
    isAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_ADMIN')),
    features: state.default.features,
    themes: state.default.themes,
    projects: state.project.projectsById,
  };
};

const container = connect(mapStateToProps)(injectIntl(formContainer));

export const EventCreateForm = container;

export default createFragmentContainer(container, {
  event: graphql`
    fragment EventForm_event on Event {
      id
      timeRange {
        startAt
        endAt
      }
      title
      addressJson
      enabled
      body
      commentable
      metaDescription
      customCode
      guestListEnabled
      themes {
        id
        title
      }
      projects {
        id
        title
      }
      media {
        url
        id
      }
      author {
        id
        displayName
      }
    }
  `,
});
