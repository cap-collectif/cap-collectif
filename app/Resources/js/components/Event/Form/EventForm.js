// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import { type FormProps, Field, reduxForm } from 'redux-form';
import { Row } from 'react-bootstrap';
import component from '../../Form/Field';
import type { Dispatch, FeatureToggles, GlobalState } from '../../../types';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { EventForm_event } from '~relay/EventForm_event.graphql';
import UserListField from '../../Admin/Field/UserListField';
import SelectTheme from '../../Utils/SelectTheme';
import SelectProject from '../../Utils/SelectProject';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import CustomPageFields from '../../Admin/Field/CustomPageFields';

type Props = {|
  ...FormProps,
  event: ?EventForm_event,
  features: FeatureToggles,
  dispatch: Dispatch,
  intl: IntlShape,
  isAdmin: boolean,
  isSuperAdmin: boolean,
  initialValues?: ?{},
  autoload: boolean,
  multi: boolean,
  onSubmit: (e: Event) => void,
  validate: (e: Event) => void,
|};

export const formName = 'EventForm';

export class EventForm extends React.Component<Props> {
  render() {
    const { features, isAdmin, event, isSuperAdmin } = this.props;

    const renderSelectThemeQuery = ({ error, props }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        return <SelectTheme query={props} multi clearable name="themes" divId="event_theme" />;
      }

      return (
        <Row>
          <Loader />
        </Row>
      );
    };
    const renderSelectProjectQuery = ({ error, props }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        /* $FlowFixMe $refType */
        return <SelectProject query={props} multi clearable object={event} name="projects" />;
      }
      return (
        <Row>
          <Loader />
        </Row>
      );
    };

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
          {(isAdmin || isSuperAdmin) && (
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
              selectFieldIsObject
            />
          )}
          <Field
            id="event_address"
            component={component}
            type="address"
            name="addressText"
            formName={formName}
            label={<FormattedMessage id="admin.fields.proposal.address" />}
            placeholder="proposal.map.form.placeholder"
          />
          {isSuperAdmin && (
            <div className="mb-5">
              <div>
                {event && event.fullAddress && (
                  <div className="clearfix mb-5">Ancienne adresse : {event.fullAddress}</div>
                )}
                {event && event.lat && event.lng && (
                  <span className="clearfix mb-5">
                    {' '}
                    Ancienne lat/lng :&nbsp; {event.lat} / {event.lng}
                  </span>
                )}
                {event &&
                  event.googleMapsAddress &&
                  event.googleMapsAddress.lat &&
                  event.googleMapsAddress.lng && (
                    <span className="clearfix mb-5">
                      {' '}
                      Nouvelle lat/lng :&nbsp; {event.googleMapsAddress.lat} /{' '}
                      {event.googleMapsAddress.lng}
                    </span>
                  )}
              </div>
            </div>
          )}
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
          <div className="d-flex justify-content-between w-23">
            <div id="event_startAt">
              <Field
                timeFormat={false}
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
                addonAfter={<i className="cap-calendar-2" />}
              />
            </div>
            <div id="event_endAt">
              <Field
                id="event_endAt"
                component={component}
                type="datetime"
                name="endAt"
                formName={formName}
                label={<FormattedMessage id="ending-date" />}
                addonAfter={<i className="cap-calendar-2" />}
              />
            </div>
          </div>
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
        {features.themes && (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query EventFormThemeQuery {
                ...SelectTheme_query
              }
            `}
            variables={{}}
            render={renderSelectThemeQuery}
          />
        )}
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventFormProjectQuery($withEventOnly: Boolean) {
              ...SelectProject_query @arguments(withEventOnly: $withEventOnly)
            }
          `}
          variables={{ withEventOnly: false }}
          render={renderSelectProjectQuery}
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
          {(isAdmin || isSuperAdmin) && (
            <div>
              <div className="box-header">
                <h3 className="box-title">
                  <FormattedMessage id="admin.fields.page.advanced" />
                </h3>
              </div>
              <CustomPageFields />
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
      isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
      features: state.default.features,
      initialValues: {
        id: props.event && props.event.id ? props.event.id : null,
        title: props.event && props.event.title ? props.event.title : null,
        startAt: props.event && props.event.timeRange ? props.event.timeRange.startAt : null,
        endAt: props.event && props.event.timeRange ? props.event.timeRange.endAt : null,
        body: props.event ? props.event.body : null,
        enabled: props.event ? props.event.enabled : null,
        commentable: props.event ? props.event.commentable : null,
        guestListEnabled: props.event ? props.event.guestListEnabled : null,
        metadescription: props.event ? props.event.metaDescription : null,
        customcode: props.event ? props.event.customCode : null,
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
        author:
          props.event && props.event.author
            ? { value: props.event.author.id, label: props.event.author.displayName }
            : null,
        addressText:
          props.event && props.event.googleMapsAddress
            ? props.event.googleMapsAddress.formatted
            : null,
        addressJson:
          props.event && props.event.googleMapsAddress ? props.event.googleMapsAddress.json : null,
      },
    };
  }
  return {
    isAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_ADMIN')),
    isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
    features: state.default.features,
  };
};

const container = connect(mapStateToProps)(injectIntl(formContainer));

export const EventCreateForm = container;

export default createFragmentContainer(container, {
  /* eslint-disable relay/unused-fields */
  event: graphql`
    fragment EventForm_event on Event {
      id
      timeRange {
        startAt
        endAt
      }
      title
      googleMapsAddress {
        formatted
        json
        lat
        lng
      }
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
      lat
      lng
      fullAddress
    }
  `,
});
