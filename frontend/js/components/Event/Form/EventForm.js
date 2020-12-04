// @flow
import * as React from 'react';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  type IntlShape,
  FormattedHTMLMessage,
} from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { Button, OverlayTrigger, ToggleButton } from 'react-bootstrap';
import Tooltip from '~/components/Utils/Tooltip';
import toggle from '~/components//Form/Toggle';
import type { Dispatch, FeatureToggles, GlobalState } from '~/types';
import type {
  EventForm_event,
  EventRefusedReason,
  EventReviewStatus,
} from '~relay/EventForm_event.graphql';
import type { EventForm_query } from '~relay/EventForm_query.graphql';
import component from '~/components/Form/Field';
import UserListField from '~/components//Admin/Field/UserListField';
import SelectTheme from '~/components//Utils/SelectTheme';
import SelectProject from '~/components//Utils/SelectProject';
import select from '~/components/Form/Select';
import approve from '~/components/Form/Approve';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import { getTranslation } from '~/services/Translation';
import { validate } from '~/components/Event/Form/EventFormPage';
import SelectStep from '~/components/Utils/SelectStep';
import colors from '~/utils/colors';
import { InformationIcon } from '~/components/Admin/Project/Content/ProjectContentAdminForm';
import type { AddressComplete } from '~/components/Form/Address/Address.type';

type SelectedCurrentValues = {|
  guestListEnabled: boolean,
  link: ?string,
  status: ?EventReviewStatus,
  projects: Array<{| value: string, label: string |}>,
  isPresential: boolean,
|};

type Values = {|
  ...SelectedCurrentValues,
  adminAuthorizeDataTransfer: boolean,
  id: ?string,
  customCode: ?string,
  media: ?Object,
  author: ?{| value: string, label: string |},
  enabled: boolean,
  commentable: boolean,
  guestListEnabled: boolean,
  addressText: ?string,
  json: ?string,
  themes: Array<{| id: string, label: string |}>,
  steps: Array<{| id: string, label: string |}>,
  startAt: ?string,
  endAt: ?string,
  recordingUrl: ?string,
  isRecordingPublished: boolean,
  title: ?string,
  body: ?string,
  metaDescription: ?string,
  link: ?string,
|};

type Props = {|
  ...ReduxFormFormProps,
  event: ?EventForm_event,
  query: EventForm_query,
  features: FeatureToggles,
  dispatch: Dispatch,
  intl: IntlShape,
  initialValues: Values,
  currentValues?: ?SelectedCurrentValues,
  autoload: boolean,
  multi: boolean,
  className?: string,
  isFrontendView: boolean,
  currentLanguage?: string,
|};

const PageTitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    width: 100%;
    padding-bottom: 15px;
    border-bottom: 1px solid ${colors.borderColor};
  }
`;

const JitsiNoReplayContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: ${colors.formBgc};
  border-radius: 4px;
  border: 2px solid ${colors.borderColor};
  padding: 30px;
  color: ${colors.darkGray};
  display: flex;
  justify-content: center;
  span {
    text-align: center;
  }
`;

const TitleHint: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  font-size: 14px;
  color: ${colors.darkGray};
  margin-left: 10px;
  font-weight: normal;
`;

const FormContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  h3 {
    font-weight: 600;
  }

  #submit-project-content {
    margin-right: 10px;
  }
`;

export const formName = 'EventForm';

export const EventForm = ({
  features,
  event,
  query,
  currentValues,
  dispatch,
  className,
  isFrontendView = false,
  intl,
  handleSubmit,
}: Props) => {
  const [isReplayAvailable, setReplayAvailability] = React.useState(false);

  React.useEffect(() => {
    async function testrecordingUrl(link: string) {
      const response = await fetch(link);
      setReplayAvailability(response.status !== 404);
    }
    if (event?.recordingUrl) {
      testrecordingUrl(event.recordingUrl);
    }
  }, [event, isReplayAvailable]);

  const isDisabled = (adminCanEdit = false): boolean => {
    if (
      query.viewer.isSuperAdmin ||
      (query.viewer.isAdmin && !features.allow_users_to_propose_events)
    ) {
      return false;
    }
    if (!event) {
      return false;
    }
    if (query.viewer.isAdmin && event.deletedAt !== null) {
      return true;
    }
    if (query.viewer.isAdmin && (event.author?.isAdmin || event.review === null)) {
      return false;
    }
    if (query.viewer.isAdmin && event.review?.status !== null && !adminCanEdit) {
      return true;
    }

    return !isFrontendView && !query.viewer.isAdmin;
  };

  const isModerationDisable = (): boolean => {
    if (query.viewer.isSuperAdmin) {
      return false;
    }
    return event?.review?.status !== 'AWAITING';
  };

  const renderJistiSection = () => {
    if (event && event.recordingUrl && isReplayAvailable) {
      return (
        <div className="mr-10">
          <Button
            id="submit-project-content"
            bsStyle="primary"
            onClick={() => {
              if (event.recordingUrl) {
                window.open(event.recordingUrl);
              }
            }}>
            <FormattedMessage id="global.play.video" />
          </Button>
          <a id="download-replay" href={event.recordingUrl} download className="btn btn-primary">
            <FormattedMessage id="global.download" />
          </a>
          <div className="mt-10">
            <Field
              name="isRecordingPublished"
              id="event_isRecordingPublished"
              component={toggle}
              disabled={isDisabled(true)}
              label={<FormattedMessage id="global.published" />}
            />
          </div>
        </div>
      );
    }
    return (
      <JitsiNoReplayContainer>
        <FormattedHTMLMessage id="activate-jitsi-recording-hint" />
      </JitsiNoReplayContainer>
    );
  };

  const refusedReasons: Array<{| value: EventRefusedReason, label: string |}> = [
    { value: 'OFFENDING', label: intl.formatMessage({ id: 'reporting.status.offending' }) },
    { value: 'OFF_TOPIC', label: intl.formatMessage({ id: 'reporting.status.off_topic' }) },
    { value: 'SEX', label: intl.formatMessage({ id: 'reporting.status.sexual' }) },
    { value: 'SPAM', label: intl.formatMessage({ id: 'reporting.status.spam' }) },
    { value: 'SYNTAX_ERROR', label: intl.formatMessage({ id: 'syntax-error' }) },
    { value: 'WRONG_CONTENT', label: intl.formatMessage({ id: 'reporting.status.error' }) },
  ];

  const selectedProjectIds =
    currentValues && currentValues.projects
      ? currentValues.projects.map(project => project.value)
      : [];

  return (
    <FormContainer>
      <form className={`eventForm ${className || ''}`} onSubmit={handleSubmit}>
        {!isFrontendView && (
          <>
            <PageTitleContainer>
              <h3 className="box-title">
                <FormattedMessage id="global.general" />
              </h3>
              <span className="mr-30 mt-15">
                {features.multilangue && <LanguageButtonContainer />}
              </span>
            </PageTitleContainer>
            <div className="color-dark-gray font-size-16">
              {event &&
                !event.author?.isAdmin &&
                event.review &&
                event.review?.status !== 'AWAITING' &&
                event.review.updatedAt &&
                features.allow_users_to_propose_events && (
                  <FormattedMessage
                    id="event-examined-on-date-by-administrator"
                    values={{
                      date: (
                        <FormattedDate
                          value={moment(event.review.updatedAt)}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      ),
                    }}
                  />
                )}
            </div>
          </>
        )}
        <div className="box-body">
          {!isFrontendView && features.unstable__remote_events ? (
            <Field
              type="radio-buttons"
              id="isPresential"
              name="isPresential"
              label={<FormattedMessage id="global.type" />}
              component={component}>
              <ToggleButton
                id="presential"
                value={!!1}
                onClick={() => dispatch(change(formName, 'isPresential', true))}>
                <FormattedMessage id="global.presential" />
              </ToggleButton>
              <ToggleButton
                id="remote"
                value={!!0}
                onClick={() => dispatch(change(formName, 'isPresential', false))}>
                <FormattedMessage id="global.online" />
              </ToggleButton>
            </Field>
          ) : null}
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
              placeholder={intl.formatMessage({ id: 'select-author' })}
              labelClassName={null}
              selectFieldIsObject
            />
          )}
          {query.viewer.isAdmin && !isFrontendView && !currentValues?.isPresential && (
            <UserListField
              clearable={false}
              label={<FormattedMessage id="global.animator" />}
              ariaControls="EventForm-filter-user-listbox"
              inputClassName="fake-inputClassName"
              autoload
              disabled={!query.viewer.isAdmin || isDisabled()}
              id="event_animator"
              name="animator"
              placeholder={null}
              labelClassName={null}
              selectFieldIsObject
            />
          )}
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
            addressProps={{
              getAddress: (addressComplete: AddressComplete) =>
                dispatch(change(formName, 'address', JSON.stringify([addressComplete]))),
            }}
          />
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
        <Field
          name="metadescription"
          type="textarea"
          label={
            <>
              <FormattedMessage id="global.meta.description" />
              <span className="excerpt inline">
                <FormattedMessage id="global.optional" />{' '}
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip
                      id="tooltip-top"
                      className="text-left"
                      style={{ wordBreak: 'break-word' }}>
                      <FormattedMessage id="admin.help.metadescription" />
                    </Tooltip>
                  }>
                  <InformationIcon />
                </OverlayTrigger>
              </span>
            </>
          }
          component={component}
          disabled={isDisabled(true)}
        />
        <div className="box-header d-flex">
          <h3 className="box-title">
            <FormattedMessage id="form.label_category" />
            <TitleHint>
              {'  '} <FormattedMessage id="allow-event-linking" />
            </TitleHint>
          </h3>
        </div>
        {features.themes && (
          <SelectTheme
            optional={isFrontendView}
            query={query}
            disabled={isDisabled(true)}
            multi
            clearable
            name="themes"
            placeholder="select-themes"
            divId="event_theme"
            label="global.themes"
          />
        )}
        <SelectProject
          query={query}
          multi
          clearable
          name="projects"
          label="admin.fields.theme.projects_count"
          placeholder="select-project"
          optional={isFrontendView}
        />
        <SelectStep
          query={query}
          multi
          clearable
          projectIds={selectedProjectIds}
          name="steps"
          disabled={selectedProjectIds.length === 0}
          label="project.show.meta.step.title"
          optional={isFrontendView}
        />
        <div>
          <div>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.options" />
              </h3>
            </div>
            <Field
              name="guestListEnabled"
              id="event_registrable"
              type="checkbox"
              component={toggle}
              disabled={!!(currentValues && currentValues.link) || isDisabled(true)}
              label={<FormattedMessage id="inscriptions-on-platform" />}
            />
            {currentValues?.guestListEnabled === false &&
              !isFrontendView &&
              query.viewer.isAdmin && (
                <Field
                  name="link"
                  label={<FormattedMessage id="link-external-subscription" />}
                  component={component}
                  placeholder="https://"
                  type="text"
                  id="event_link"
                />
              )}
            {query.viewer.isAdmin && !isFrontendView && (
              <Field
                name="adminAuthorizeDataTransfer"
                id="event_adminAuthorizeDataTransfer"
                type="checkbox"
                component={toggle}
                label={<FormattedMessage id="authorize-transfer-of-data-to-event-organizer" />}
              />
            )}
            {!isFrontendView && (
              <Field
                name="commentable"
                id="event_commentable"
                type="checkbox"
                component={toggle}
                disabled={isDisabled(true)}
                label={<FormattedMessage id="admin.fields.proposal.comments" />}
              />
            )}
          </div>
          {!query.viewer.isAdmin && isFrontendView && (
            <div>
              <div className="box-header box-title" />
              <div>
                <Field
                  name="authorAgreeToUsePersonalDataForEventOnly"
                  id="event_authorAgreeToUsePersonalDataForEventOnly"
                  type="checkbox"
                  normalize={val => !!val}
                  component={component}
                  disabled={isDisabled()}
                  children={
                    <FormattedMessage id="checkbox-event-data-transfer-warning-to-organizer" />
                  }
                />
              </div>
            </div>
          )}
          {query.viewer.isAdmin && !isFrontendView && (
            <div>
              <div className="box-header pt-0">
                <h3 className="box-title">
                  <FormattedMessage id="global.publication" />
                </h3>
              </div>

              {event &&
              !event.author?.isAdmin &&
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
                    disabled={isModerationDisable()}
                    label={
                      <FormattedMessage id="admin.action.recent_contributions.unpublish.input_label" />
                    }
                  />
                  {currentValues?.status === 'REFUSED' && (
                    <>
                      <Field
                        name="refusedReason"
                        id="event_refusedReason"
                        type="select"
                        required
                        component={select}
                        disabled={isModerationDisable()}
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
                        disabled={isModerationDisable()}
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
                  label={<FormattedMessage id="global.published" />}
                />
              )}
              {!currentValues?.isPresential && (
                <div className="box-header">
                  <h3 className="box-title replay-container">
                    <FormattedMessage id="global.replay" />
                  </h3>
                  {renderJistiSection()}
                </div>
              )}
              <div className="box-header">
                <h3 className="box-title">
                  <FormattedMessage id="global-customization" />
                </h3>
              </div>

              <Field
                name="customcode"
                type="textarea"
                label={
                  <>
                    <FormattedMessage id="admin.customcode" />
                    <span className="excerpt inline">
                      <FormattedMessage id="global.optional" />{' '}
                      <OverlayTrigger
                        key="top"
                        placement="top"
                        overlay={
                          <Tooltip
                            id="tooltip-top"
                            className="text-left"
                            style={{ wordBreak: 'break-word' }}>
                            <FormattedMessage id="admin.help.customcode" />
                          </Tooltip>
                        }>
                        <InformationIcon />
                      </OverlayTrigger>
                    </span>
                  </>
                }
                component={component}
                disabled={isDisabled(true)}
                placeholder='<script type="text/javascript"> </script>"'
              />
            </div>
          )}
        </div>
      </form>
    </FormContainer>
  );
};

const selector = formValueSelector(formName);

const formContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  validate,
})(EventForm);

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (props.event) {
    const translation = props.event?.translations
      ? getTranslation(props.event?.translations, state.language.currentLanguage)
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
        adminAuthorizeDataTransfer: props.event?.adminAuthorizeDataTransfer || false,
        authorAgreeToUsePersonalDataForEventOnly: props.event
          ?.authorAgreeToUsePersonalDataForEventOnly
          ? props.event.authorAgreeToUsePersonalDataForEventOnly
          : false,
        link: translation ? translation.link : null,
        metadescription: translation ? translation.metaDescription : null,
        customcode: props.event ? props.event.customCode : null,
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
        steps:
          props.event && props.event.steps
            ? props.event.steps.map(p => ({
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
        recordingUrl: props.event && props.event.recordingUrl,
        isPresential: props.event ? props.event.isPresential : true,
        animator:
          props.event && props.event.animator
            ? { value: props.event.animator.id, label: props.event.animator.displayName }
            : null,
        isRecordingPublished: props.event && props.event.isRecordingPublished,
        addressJson:
          props.event && props.event.googleMapsAddress ? props.event.googleMapsAddress.json : null,
        translations: props.event && props.event.translations ? props.event.translations : [],
      },
      currentValues: selector(
        state,
        'guestListEnabled',
        'link',
        'status',
        'projects',
        'isPresential',
      ),
    };
  }

  return {
    currentLanguage: state.language.currentLanguage,
    features: state.default.features,
    currentValues: selector(
      state,
      'guestListEnabled',
      'link',
      'status',
      'projects',
      'isPresential',
    ),
    initialValues: {
      authorAgreeToUsePersonalDataForEventOnly: false,
      isPresential: true,
      guestListEnabled: false,
    },
  };
};

const container = connect(mapStateToProps)(injectIntl(formContainer));

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventForm_query on Query {
      ...SelectTheme_query
      ...SelectProject_query
      ...SelectStep_query
      viewer {
        isAdmin
        isSuperAdmin
      }
    }
  `,
  event: graphql`
    fragment EventForm_event on Event {
      id
      isPresential
      recordingUrl
      isRecordingPublished
      animator {
        id
        displayName
      }
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
      deletedAt
      themes {
        id
        title
      }
      projects {
        id
        title
      }
      steps {
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
        updatedAt
      }
      translations {
        locale
        title
        body
        metaDescription
        link
      }
      authorAgreeToUsePersonalDataForEventOnly
      adminAuthorizeDataTransfer
    }
  `,
});
