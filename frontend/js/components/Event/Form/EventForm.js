// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import { type FormProps, Field, reduxForm, formValueSelector } from 'redux-form';
import component from '~/components//Form/Field';
import toggle from '~/components//Form/Toggle';
import type { Dispatch, FeatureToggles, GlobalState } from '~/types';
import type { EventForm_event, EventRefusedReason } from '~relay/EventForm_event.graphql';
import type { EventForm_query } from '~relay/EventForm_query.graphql';
import UserListField from '~/components//Admin/Field/UserListField';
import SelectTheme from '~/components//Utils/SelectTheme';
import SelectProject from '~/components//Utils/SelectProject';
import CustomPageFields from '~/components//Admin/Field/CustomPageFields';
import select from '~/components/Form/Select';
import approve from '~/components/Form/Approve';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import { getTranslation } from '~/services/Translation';

type Props = {|
  ...FormProps,
  event: ?EventForm_event,
  query: EventForm_query,
  features: FeatureToggles,
  dispatch: Dispatch,
  intl: IntlShape,
  initialValues: Object,
  currentValues?: ?{},
  autoload: boolean,
  multi: boolean,
  className?: string,
  isFrontendView: boolean,
  currentLanguage: string,
|};

const PageTitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const formName = 'EventForm';

export class EventForm extends React.Component<Props> {
  static defaultProps = {
    isFrontendView: false,
  };

  render() {
    const { features, event, query, currentValues, className, isFrontendView, intl } = this.props;
    const isDisabled = (): boolean => {
      return !isFrontendView && event?.review && !query.viewer.isSuperAdmin;
    };

    const refusedReasons: Array<{| value: EventRefusedReason, label: string |}> = [
      { value: 'OFFENDING', label: intl.formatMessage({ id: 'reporting.status.offending' }) },
      { value: 'OFF_TOPIC', label: intl.formatMessage({ id: 'reporting.status.off_topic' }) },
      { value: 'SEX', label: intl.formatMessage({ id: 'reporting.status.sexual' }) },
      { value: 'SPAM', label: intl.formatMessage({ id: 'reporting.status.spam' }) },
      { value: 'SYNTAX_ERROR', label: intl.formatMessage({ id: 'syntax-error' }) },
      { value: 'WRONG_CONTENT', label: intl.formatMessage({ id: 'reporting.status.error' }) },
    ];

    return (
      <form className={`eventForm ${className || ''}`}>
        {!isFrontendView && (
          <PageTitleContainer>
            <h3 className="box-title">
              <FormattedMessage id="global.general" />
            </h3>
            <span className="mr-30 mt-15">
              {features.unstable__multilangue && <LanguageButtonContainer />}
            </span>
          </PageTitleContainer>
        )}
        <div className="box-body">
          <Field
            name="title"
            label={<FormattedMessage id="global.title" />}
            component={component}
            disabled={isDisabled()}
            type="text"
            id="event_title"
          />
          {query.viewer.isAdmin && !isFrontendView && (
            <UserListField
              clearable={false}
              label={<FormattedMessage id="global.author" />}
              ariaControls="EventForm-filter-user-listbox"
              inputClassName="fake-inputClassName"
              autoload
              disabled={!query.viewer.isAdmin || isDisabled()}
              id="event_author"
              name="author"
              placeholder={null}
              labelClassName={null}
              selectFieldIsObject
            />
          )}
          {
            <Field
              id="event_address"
              component={component}
              type={isDisabled() ? 'text' : 'address'}
              name="addressText"
              formName={formName}
              disabled={isDisabled()}
              label={
                <div>
                  <FormattedMessage id="proposal_form.address" />
                  <div className="excerpt inline">
                    <FormattedMessage id="global.optional" />
                  </div>
                </div>
              }
              placeholder="proposal.map.form.placeholder"
            />
          }
          {/* This part is tempory, it will be delete after migration complete */}
          {query.viewer.isSuperAdmin && !isFrontendView && (
            <div className="mb-5">
              <div>
                {event && event.fullAddress && (
                  <div className="clearfix mb-5">
                    <FormattedMessage id="old-address" />: {event.fullAddress}
                  </div>
                )}
                {event && event.lat && event.lng && (
                  <div className="clearfix mb-5">
                    {' '}
                    <FormattedMessage id="old-latitude" />: &nbsp; {event.lat} / {event.lng}
                  </div>
                )}
                {event &&
                  event.googleMapsAddress &&
                  event.googleMapsAddress.lat &&
                  event.googleMapsAddress.lng && (
                    <div className="clearfix mb-5">
                      {' '}
                      <FormattedMessage id="new-latitude" />
                      :&nbsp; {event.googleMapsAddress.lat} / {event.googleMapsAddress.lng}
                    </div>
                  )}
              </div>
            </div>
          )}
          <Field
            id="event_body"
            type="admin-editor"
            name="body"
            component={component}
            disabled={isDisabled()}
            label={<FormattedMessage id="global.description" />}
          />
          <div className="datePickContainer">
            <Field
              timeFormat={false}
              id="event_startAt"
              dateTimeInputProps={{ id: 'event_input_startAt', disabled: isDisabled() }}
              component={component}
              type="datetime"
              name="startAt"
              formName={formName}
              label={<FormattedMessage id="start-date" />}
              addonAfter={<i className="cap-calendar-2" />}
            />
            <Field
              id="event_endAt"
              dateTimeInputProps={{ id: 'event_input_endAt', disabled: isDisabled() }}
              component={component}
              type="datetime"
              className="adminDate"
              name="endAt"
              formName={formName}
              label={
                <div>
                  <FormattedMessage id="ending-date" />
                  <div className="excerpt inline">
                    <FormattedMessage id="global.optional" />
                  </div>
                </div>
              }
              addonAfter={<i className="cap-calendar-2" />}
            />
          </div>
          <Field
            id="event_media"
            name="media"
            disabled={isDisabled()}
            label={
              <div>
                <FormattedMessage id="global.illustration" />
                <div className="excerpt inline">
                  <FormattedMessage id="global.optional" />
                </div>
              </div>
            }
            component={component}
            type="image"
          />
        </div>
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="form.label_category" />
          </h3>
        </div>
        <span className="help-block">
          <FormattedMessage id="allow-event-linking" />
        </span>
        {features.themes && (
          <SelectTheme
            optional={isFrontendView}
            query={query}
            disabled={isDisabled()}
            multi
            clearable
            name="themes"
            divId="event_theme"
            label="global.themes"
          />
        )}
        <SelectProject
          query={query}
          multi
          clearable
          name="projects"
          disabled={isDisabled()}
          label="global.participative.project"
          optional={isFrontendView}
        />
        <div>
          <div>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.options" />
              </h3>
            </div>
            <div className="ml-10 pl-10">
              <Field
                name="guestListEnabled"
                id="event_registrable"
                type="checkbox"
                component={component}
                disabled={
                  !!(currentValues && currentValues.link && currentValues.link !== null) ||
                  isDisabled()
                }
                children={<FormattedMessage id="admin.fields.event.registration_enable" />}
              />
            </div>
            <div className="clearfix">
              <Field
                name="link"
                label={<FormattedMessage id="admin.fields.event.link" />}
                component={component}
                placeholder="http://"
                type="text"
                disabled={
                  isDisabled() ||
                  (currentValues &&
                  currentValues.guestListEnabled &&
                  currentValues.guestListEnabled !== null
                    ? currentValues.guestListEnabled
                    : false)
                }
                id="event_link"
              />
            </div>
            {!isFrontendView && (
              <div className="ml-10 pl-10">
                <Field
                  name="commentable"
                  id="event_commentable"
                  type="checkbox"
                  component={component}
                  disabled={isDisabled()}
                  children={<FormattedMessage id="admin.fields.blog_post.is_commentable" />}
                />
              </div>
            )}
          </div>
          {query.viewer.isAdmin && !isFrontendView && (
            <div>
              <div className="box-header">
                <h3 className="box-title">
                  <FormattedMessage id="admin.fields.step.advanced" />
                </h3>
              </div>
              <CustomPageFields disabled={isDisabled()} />
              <div className="box-header pt-0">
                <h3 className="box-title">
                  <FormattedMessage id="global.publication" />
                </h3>
              </div>

              {event &&
              !event.author.isAdmin &&
              event.review?.status &&
              features.allow_users_to_propose_events ? (
                <>
                  <span className="help-block">
                    <FormattedMessage id="author-will-be-notified-of-this-message" />
                  </span>
                  <Field
                    name="status"
                    id="event_status"
                    type="text"
                    component={approve}
                    approvedValue="APPROVED"
                    refusedValue="REFUSED"
                    disabled={isDisabled()}
                    label={
                      <FormattedMessage id="admin.action.recent_contributions.unpublish.input_label" />
                    }
                  />
                  {currentValues.status === 'REFUSED' && (
                    <>
                      <Field
                        name="refusedReason"
                        id="event_refusedReason"
                        type="select"
                        required
                        component={select}
                        disabled={isDisabled()}
                        label={
                          <FormattedMessage id="admin.action.recent_contributions.unpublish.input_label" />
                        }
                        options={refusedReasons}
                      />
                      <Field
                        name="comment"
                        id="event_comment"
                        type="textarea"
                        component={component}
                        disabled={isDisabled()}
                        label={<FormattedMessage id="details" />}
                      />
                    </>
                  )}
                </>
              ) : (
                <Field
                  name="enabled"
                  id="event_enabled"
                  type="checkbox"
                  component={toggle}
                  disabled={isDisabled()}
                  label={
                    <div>
                      <FormattedMessage id="global.published" />
                      <div className="excerpt inline">
                        <FormattedMessage id="global.optional" />
                      </div>
                    </div>
                  }
                />
              )}
            </div>
          )}
        </div>
      </form>
    );
  }
}

const selector = formValueSelector(formName);

const formContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
})(EventForm);

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (props.event) {
    const translation = props.event.translations
      ? getTranslation(props.event.translations, state.language.currentLanguage)
      : undefined;
    return {
      currentLanguage: state.language.currentLanguage,
      features: state.default.features,
      initialValues: {
        id: props.event && props.event.id ? props.event.id : null,
        title: translation ? translation.title : null,
        startAt: props.event && props.event.timeRange ? props.event.timeRange.startAt : null,
        endAt: props.event && props.event.timeRange ? props.event.timeRange.endAt : null,
        body: translation ? translation.body : null,
        enabled: props.event ? props.event.enabled : null,
        commentable: props.event ? props.event.commentable : null,
        guestListEnabled: props.event ? props.event.guestListEnabled : null,
        link: translation ? translation.link : null,
        custom: {
          metadescription: translation ? translation.metaDescription : null,
          customcode: props.event ? props.event.customCode : null,
        },
        media: props.event ? props.event.media : null,
        comment: props.event && props.event.review ? props.event.review.comment : null,
        status: props.event && props.event.review ? props.event.review.status : null,
        refusedReason: props.event && props.event.review ? props.event.review.refusedReason : null,
        projects:
          props.event && props.event.projects
            ? props.event.projects.map(p => ({
                value: p.id,
                label: p.title,
              }))
            : [],
        themes:
          props.event && props.event.themes
            ? props.event.themes.map(th => ({
                value: th.id,
                label: th.title,
              }))
            : [],
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
        translations: props.event && props.event.translations ? props.event.translations : [],
      },
      currentValues: selector(state, 'guestListEnabled', 'link', 'status'),
    };
  }

  return {
    currentLanguage: state.language.currentLanguage,
    features: state.default.features,
    currentValues: selector(state, 'guestListEnabled', 'link', 'status'),
  };
};

const container = connect(mapStateToProps)(injectIntl(formContainer));

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventForm_query on Query {
      ...SelectTheme_query
      ...SelectProject_query
      viewer {
        isAdmin
        isSuperAdmin
      }
    }
  `,
  event: graphql`
    fragment EventForm_event on Event {
      id
      timeRange {
        startAt
        endAt
      }
      googleMapsAddress {
        formatted
        json
        lat
        lng
      }
      enabled
      commentable
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
        isAdmin
      }
      lat
      lng
      fullAddress
      review {
        status
        comment
        refusedReason
      }
      translations {
        locale
        title
        body
        metaDescription
        link
      }
    }
  `,
});
