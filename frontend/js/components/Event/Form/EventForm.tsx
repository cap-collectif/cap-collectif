import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, FormattedDate, injectIntl, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import moment from 'moment'
import { createFragmentContainer, graphql } from 'react-relay'

import styled from 'styled-components'
import { Field, reduxForm, formValueSelector, change } from 'redux-form'
import { Flex } from '@cap-collectif/ui'
import toggle from '~/components//Form/Toggle'
import type { Dispatch, GlobalState } from '~/types'
import type { EventForm_event, EventRefusedReason, EventReviewStatus } from '~relay/EventForm_event.graphql'
import type { EventForm_query } from '~relay/EventForm_query.graphql'
import component from '~/components/Form/Field'
import UserListField from '~/components/Admin/Field/UserListField'
import SelectTheme, { renderLabel } from '~/components/Utils/SelectTheme'
import SelectProject from '~/components/Event/Form/SelectProject'
import select from '~/components/Form/Select'
import approve from '~/components/Form/Approve'
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer'
import { getTranslation } from '~/services/Translation'
import SelectStep from '~/components/Event/Form/SelectStep'
import colors, { styleGuideColors } from '~/utils/colors'
import { InformationIcon } from '~/components/Admin/Project/Content/ProjectContentAdminForm'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { isFloat } from '~/utils/string'
import Tooltip from '~ds/Tooltip/Tooltip'
import SelectDistrict from '~/components/Event/Form/SelectDistrict'
import { normalizeNumberInput } from '~/components/Form/utils'

type SelectedCurrentValues = {
  guestListEnabled: boolean
  measurable: boolean
  link: string | null | undefined
  status: EventReviewStatus | null | undefined
  projects: Array<{
    value: string
    label: string
  }>
}
type Values = SelectedCurrentValues & {
  adminAuthorizeDataTransfer: boolean
  id: string | null | undefined
  customCode: string | null | undefined
  media: Record<string, any> | null | undefined
  author:
    | {
        value: string
        label: string
      }
    | null
    | undefined
  enabled: boolean
  commentable: boolean
  guestListEnabled: boolean
  addressText: string | null | undefined
  json: string | null | undefined
  themes: Array<{
    id: string
    label: string
  }>
  steps: Array<{
    id: string
    label: string
  }>
  startAt: string | null | undefined
  endAt: string | null | undefined
  title: string | null | undefined
  body: string | null | undefined
  metaDescription: string | null | undefined
  link: string | null | undefined
  bodyUsingJoditWysiwyg?: boolean
}
type Props = ReduxFormFormProps & {
  event: EventForm_event | null | undefined
  query: EventForm_query
  dispatch: Dispatch
  intl: IntlShape
  initialValues: Values
  currentValues?: SelectedCurrentValues | null | undefined
  autoload: boolean
  multi: boolean
  className?: string
  isFrontendView: boolean
  currentLanguage?: string
  bodyUsingJoditWysiwyg?: boolean
}
const PageTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    width: 100%;
    padding-bottom: 15px;
    border-bottom: 1px solid ${colors.borderColor};
  }
`
const TitleHint = styled.span`
  font-size: 14px;
  color: ${colors.darkGray};
  margin-left: 10px;
  font-weight: normal;
`
const FormContainer = styled.div`
  h3 {
    font-weight: 600;
  }

  #submit-project-content {
    margin-right: 10px;
  }
`
const OptionContainer = styled.div<{
  isFrontendView: boolean
}>`
  .form-group label {
    font-weight: 400;
    color: ${styleGuideColors.gray900};
  }
  .guest-group {
    display: flex;
    flex-direction: row-reverse;
    width: 188px;
    margin-bottom: 14px !important;
  }

  .registration-group {
    ${props =>
      props.isFrontendView &&
      `
    margin-left: 26px;
  `};
    label {
      margin-bottom: 0 !important;
    }
    input[name='maxRegistrations'] {
      width: 104px;
      height: 32px;
    }
  }
`
export const formName = 'EventForm'
export type FormValues = {
  customcode: string
  metadescription: string
  title: string
  body: string
  author?: {
    value: string
    label: string
  }
  startAt: string
  endAt: string | null | undefined
  commentable: boolean
  guestListEnabled: boolean
  link: string | null | undefined
  addressJson: string | null | undefined
  addressText: string | null | undefined
  enabled: boolean
  media:
    | {
        id: string
        url: string
      }
    | null
    | undefined
  districts: []
  themes: []
  projects: []
  steps: []
  refusedReason: EventRefusedReason | null | undefined
  status: EventReviewStatus | null | undefined
  authorAgreeToUsePersonalDataForEventOnly: boolean | null | undefined
  adminAuthorizeDataTransfer: boolean | null | undefined
  bodyUsingJoditWysiwyg: boolean
  maxRegistrations: string | null | undefined
  measurable: boolean
}
export const validate = (values: FormValues, props: Props) => {
  const { isFrontendView, event } = props
  const errors: any = {}
  const fields = ['title', 'startAt', 'endAt', 'body']
  fields.forEach(value => {
    if (value === 'endAt' && values.endAt) {
      if (!values.startAt) {
        errors.startAt = 'fill-field'
      }

      if (values.startAt) {
        if (moment(values.startAt).isAfter(moment(values.endAt))) {
          errors.endAt = {
            id: 'event-before-date-error',
            values: {
              before: '<i class="cap cap-attention pr-5" />',
            },
          }
        }
      }
    }

    if (value === 'body' && values[value] && values[value] === '<p><br></p>') {
      errors[value] = 'fill-field'
    }

    if (value !== 'endAt' && (!values[value] || values[value].length === 0)) {
      errors[value] = 'fill-field'
    }
  })

  if (props.query.viewer.isOnlyProjectAdmin || props.query.viewer.organizations?.[0]) {
    if (!values.projects || values.projects.length === 0) {
      errors.projects = 'fill-field'
    }
  }

  if (values.guestListEnabled && values.link) {
    errors.link = 'error-alert-choosing-subscription-mode'
  }

  const isMaxRegistrationOnError =
    (values.maxRegistrations && Number.isNaN(Number(values.maxRegistrations))) ||
    (values.maxRegistrations && Number(values.maxRegistrations) <= 0 && values.maxRegistrations.length > 0) ||
    isFloat(Number(values.maxRegistrations))
  const isBackOfficeView = !isFrontendView
  const isMaxRegistrationLowerThanUserRegisterd =
    isBackOfficeView &&
    values.maxRegistrations &&
    event?.participants &&
    event.participants.totalCount > 0 &&
    Number(values.maxRegistrations) < event.participants.totalCount

  if (isMaxRegistrationOnError) {
    errors.maxRegistrations = 'must-be-positive-integer'
  } else if (isMaxRegistrationLowerThanUserRegisterd) {
    errors.maxRegistrations = 'maxRegistration-error'
  }

  if (values.status === 'REFUSED' && (!values.refusedReason || values.refusedReason === 'NONE')) {
    errors.refusedReason = 'fill-field'
  }

  if (isFrontendView && values.authorAgreeToUsePersonalDataForEventOnly === false) {
    errors.authorAgreeToUsePersonalDataForEventOnly = {
      id: 'error-message-event-creation-checkbox',
      values: {
        before: '<i class="cap cap-attention pr-5" />',
      },
    }
  }

  if (values.metadescription !== null && values?.metadescription?.length > 160) {
    errors.metadescription = {
      id: 'characters-maximum',
      values: {
        quantity: 160,
      },
    }
  }

  if (!values.author) {
    errors.author = 'fill-field'
  }

  return errors
}
export const EventForm = ({
  event,
  query,
  currentValues,
  dispatch,
  className,
  isFrontendView = false,
  handleSubmit,
  currentLanguage,
}: Props) => {
  const intl = useIntl()
  const isFeatureUserEventEnabled = useFeatureFlag('allow_users_to_propose_events')
  const isFeatureMultiLangueEnabled = useFeatureFlag('multilangue')
  const isFeatureThemesEnabled = useFeatureFlag('themes')
  const isBackOfficeView = !isFrontendView
  const organization = query.viewer.organizations ? query.viewer.organizations[0] : null
  const owner = organization ?? query.viewer

  const isDisabled = (adminCanEdit = false): boolean => {
    if (
      query.viewer.isSuperAdmin ||
      query.viewer.isOnlyProjectAdmin ||
      (query.viewer.isAdmin && !isFeatureUserEventEnabled) ||
      organization
    ) {
      return false
    }

    if (!event) {
      return false
    }

    if (query.viewer.isAdmin && event.deletedAt !== null) {
      return true
    }

    if (query.viewer.isAdmin && (event.author?.isAdmin || event.review === null)) {
      return false
    }

    if (query.viewer.isAdmin && event.review?.status !== null && !adminCanEdit) {
      return true
    }

    return isBackOfficeView && !query.viewer.isAdmin
  }

  const isModerationDisable = (): boolean => {
    if (query.viewer.isSuperAdmin) {
      return false
    }

    return event?.review?.status !== 'AWAITING'
  }

  const refusedReasons: Array<{
    value: EventRefusedReason
    label: string
  }> = [
    {
      value: 'OFFENDING',
      label: intl.formatMessage({
        id: 'reporting.status.offending',
      }),
    },
    {
      value: 'OFF_TOPIC',
      label: intl.formatMessage({
        id: 'reporting.status.off_topic',
      }),
    },
    {
      value: 'SEX',
      label: intl.formatMessage({
        id: 'reporting.status.sexual',
      }),
    },
    {
      value: 'SPAM',
      label: intl.formatMessage({
        id: 'reporting.status.spam',
      }),
    },
    {
      value: 'SYNTAX_ERROR',
      label: intl.formatMessage({
        id: 'syntax-error',
      }),
    },
    {
      value: 'WRONG_CONTENT',
      label: intl.formatMessage({
        id: 'reporting.status.error',
      }),
    },
  ]
  const selectedProjectIds =
    currentValues && currentValues.projects ? currentValues.projects.map(project => project.value) : []
  const displayMaximumField =
    isFrontendView ||
    (isBackOfficeView && currentValues?.guestListEnabled === true && currentValues?.measurable === true) ||
    (isBackOfficeView && event?.review)
  const displayMeasurable = isBackOfficeView && currentValues?.guestListEnabled === true && !event?.review
  let isMaxRegistrationEnable = false

  if ((isBackOfficeView && !event?.review) || (isFrontendView && currentValues && currentValues.guestListEnabled)) {
    isMaxRegistrationEnable = true
  }

  const displaysTheDateOfTheReview =
    event &&
    !event.author?.isAdmin &&
    event.review &&
    event.review?.status !== 'AWAITING' &&
    event.review.updatedAt &&
    isFeatureUserEventEnabled
  const displayLinkField =
    isBackOfficeView && currentValues && currentValues?.guestListEnabled === false && query.viewer.isAdmin
  return (
    <FormContainer>
      <form className={`eventForm ${className || ''}`} onSubmit={handleSubmit}>
        {isBackOfficeView && (
          <>
            <PageTitleContainer>
              <h3 className="box-title">
                {intl.formatMessage({
                  id: 'global.general',
                })}
              </h3>
              {/**@ts-ignore */}
              <span className="mr-30 mt-15">{isFeatureMultiLangueEnabled && <LanguageButtonContainer />}</span>
            </PageTitleContainer>
            <div className="color-dark-gray font-size-16">
              {displaysTheDateOfTheReview && event?.review && (
                <FormattedMessage
                  id="event-examined-on-date-by-administrator"
                  values={{
                    date: (
                      /* @ts-ignore*/ <FormattedDate
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
          <Field
            name="title"
            label={intl.formatMessage({
              id: 'global.title',
            })}
            component={component}
            disabled={isDisabled()}
            type="text"
            id="event_title"
          />
          {isBackOfficeView && (
            <UserListField
              clearable={false}
              label={<FormattedMessage id="global.author" />}
              ariaControls="EventForm-filter-user-listbox"
              inputClassName="fake-inputClassName"
              autoload
              disabled={query.viewer.isOnlyProjectAdmin || isDisabled() || !!organization}
              id="event_author"
              name="author"
              placeholder={intl.formatMessage({
                id: 'select-author',
              })}
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
                {intl.formatMessage({
                  id: 'proposal_form.address',
                })}
                <div className="excerpt inline">
                  {intl.formatMessage({
                    id: 'global.optional',
                  })}
                </div>
              </div>
            }
            placeholder="proposal.map.form.placeholder"
            addressProps={{
              getAddress: (addressComplete: AddressComplete | null | undefined) =>
                dispatch(
                  change(
                    formName,
                    'addressJson',
                    addressComplete ? JSON.stringify([addressComplete]) : addressComplete,
                  ),
                ),
            }}
          />
          <Field
            id="event_body"
            type={isFrontendView ? 'admin-editor-ds' : 'admin-editor'}
            name="body"
            component={component}
            disabled={isDisabled()}
            label={intl.formatMessage({
              id: 'global.description',
            })}
            key={currentLanguage}
          />
          <div className="datePickContainer">
            <Field
              timeFormat={false}
              id="event_startAt"
              dateTimeInputProps={{
                id: 'event_input_startAt',
                disabled: isDisabled(),
              }}
              component={component}
              type="datetime"
              name="startAt"
              formName={formName}
              label={intl.formatMessage({
                id: 'start-date',
              })}
              addonAfter={<i className="cap-calendar-2" />}
            />
            <Field
              id="event_endAt"
              dateTimeInputProps={{
                id: 'event_input_endAt',
                disabled: isDisabled(),
              }}
              component={component}
              type="datetime"
              className="adminDate"
              name="endAt"
              formName={formName}
              label={
                <div>
                  {intl.formatMessage({
                    id: 'ending-date',
                  })}
                  <div className="excerpt inline">
                    {intl.formatMessage({
                      id: 'global.optional',
                    })}
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
                {intl.formatMessage({
                  id: 'global.illustration',
                })}
                <div className="excerpt inline">
                  {intl.formatMessage({
                    id: 'global.optional',
                  })}
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
            <Flex direction="row" wrap="nowrap">
              {intl.formatMessage({
                id: 'global.meta.description',
              })}
              <Flex direction="row" wrap="nowrap" className="excerpt inline">
                {intl.formatMessage({
                  id: 'global.optional',
                })}{' '}
                <Tooltip
                  placement="top"
                  label={intl.formatMessage({
                    id: 'admin.help.metadescription',
                  })}
                  id="tooltip-top"
                  className="text-left"
                  style={{
                    wordBreak: 'break-word',
                  }}
                >
                  <div>
                    <InformationIcon />
                  </div>
                </Tooltip>
              </Flex>
            </Flex>
          }
          component={component}
          disabled={isDisabled(true)}
        />
        <div className="box-header d-flex">
          <h3 className="box-title">
            {intl.formatMessage({
              id: 'form.label_category',
            })}
            <TitleHint>
              {'  '}{' '}
              {intl.formatMessage({
                id: 'allow-event-linking',
              })}
            </TitleHint>
          </h3>
        </div>
        {isFeatureThemesEnabled && (
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
          projectOwner={owner}
          multi
          clearable
          name="projects"
          label="admin.fields.theme.projects_count"
          placeholder="select-project"
          optional={isFrontendView}
          disabled={false}
        />
        <SelectDistrict
          query={query}
          multi
          clearable
          name="districts"
          label="global.district"
          placeholder="select-one-or-more-zones"
          optional={isFrontendView}
          disabled={false}
        />
        <SelectStep
          projectOwner={owner}
          multi
          clearable
          projectIds={selectedProjectIds}
          name="steps"
          disabled={selectedProjectIds.length === 0}
          label="project.show.meta.step.title"
          optional={isFrontendView}
        />
        <div>
          <OptionContainer isFrontendView={isFrontendView}>
            <div className="box-header">
              <h3 className="box-title">
                {intl.formatMessage({
                  id: 'global.options',
                })}
              </h3>
            </div>
            <Field
              groupClassName="guest-group"
              name="guestListEnabled"
              id="event_registrable"
              type="checkbox"
              component={isFrontendView ? component : toggle}
              disabled={!!(currentValues && currentValues.link) || isDisabled(true)}
              label={intl.formatMessage({
                id: isFrontendView ? 'allow-inscriptions' : 'inscriptions-on-platform',
              })}
            />
            {displayLinkField && (
              <Field
                name="link"
                label={intl.formatMessage({
                  id: 'link-external-subscription',
                })}
                component={component}
                placeholder="https://"
                type="text"
                id="event_link"
              />
            )}

            {(!query.viewer.isOnlyProjectAdmin && isBackOfficeView && isFeatureUserEventEnabled) && (
              <Field
                name="adminAuthorizeDataTransfer"
                id="event_adminAuthorizeDataTransfer"
                type="checkbox"
                component={toggle}
                label={intl.formatMessage({
                  id: 'authorize-transfer-of-data-to-event-organizer',
                })}
              />
            )}
            {isBackOfficeView && (
              <Field
                name="commentable"
                id="event_commentable"
                type="checkbox"
                component={toggle}
                disabled={isDisabled(true)}
                label={intl.formatMessage({
                  id: 'admin.fields.proposal.comments',
                })}
              />
            )}
            {displayMeasurable && (
              <Field
                groupClassName="registration-group"
                name="measurable"
                label={intl.formatMessage({
                  id: 'measurable-registration',
                })}
                component={toggle}
                type="checkbox"
                id="event_measurable"
              />
            )}
            {displayMaximumField && (
              <Field
                groupClassName="registration-group"
                name="maxRegistrations"
                label={renderLabel(
                  intl,
                  intl.formatMessage({
                    id: isFrontendView ? 'max-registrations' : 'maximum-vote',
                  }),
                  isFrontendView,
                )}
                component={component}
                disabled={!isMaxRegistrationEnable}
                type="number"
                normalize={normalizeNumberInput}
                min="0"
                id="event_maxRegistrations"
              />
            )}
          </OptionContainer>
          {!query.viewer.isAdmin && isFrontendView && (
            <div>
              <div className="box-header box-title" />
              <div>
                <Field
                  required={false}
                  optional={isFrontendView}
                  name="authorAgreeToUsePersonalDataForEventOnly"
                  id="event_authorAgreeToUsePersonalDataForEventOnly"
                  type="checkbox"
                  normalize={val => !!val}
                  component={component}
                  disabled={isDisabled()}
                >
                  {intl.formatMessage({
                    id: 'checkbox-event-data-transfer-warning-to-organizer',
                  })}
                </Field>
              </div>
            </div>
          )}
          {(query.viewer.isAdmin || query.viewer.isOnlyProjectAdmin || organization) && isBackOfficeView && (
            <div>
              <div className="box-header pt-0">
                <h3 className="box-title">
                  {intl.formatMessage({
                    id: 'global.publication',
                  })}
                </h3>
              </div>

              {event && !event.author?.isAdmin && event.review?.status && isFeatureUserEventEnabled ? (
                <>
                  <span className="help-block">
                    {intl.formatMessage({
                      id: 'author-will-be-notified-of-this-message',
                    })}
                  </span>
                  <Field
                    name="status"
                    id="event_status"
                    type="text"
                    component={approve}
                    approvedValue="APPROVED"
                    refusedValue="REFUSED"
                    disabled={isModerationDisable()}
                    label={intl.formatMessage({
                      id: 'admin.action.recent_contributions.unpublish.input_label',
                    })}
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
                        label={intl.formatMessage({
                          id: 'admin.action.recent_contributions.unpublish.input_label',
                        })}
                        options={refusedReasons}
                      />
                      <Field
                        name="comment"
                        id="event_comment"
                        type="textarea"
                        component={component}
                        disabled={isModerationDisable()}
                        label={intl.formatMessage({
                          id: 'details',
                        })}
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
                  label={intl.formatMessage({
                    id: 'global.published',
                  })}
                />
              )}
              <div className="box-header">
                <h3 className="box-title">
                  {intl.formatMessage({
                    id: 'global-customization',
                  })}
                </h3>
              </div>
              <Field
                name="customcode"
                type="textarea"
                label={
                  <Flex direction="row" wrap="nowrap">
                    {intl.formatMessage({
                      id: 'admin.customcode',
                    })}
                    <Flex direction="row" wrap="nowrap" className="excerpt inline">
                      {intl.formatMessage({
                        id: 'global.optional',
                      })}{' '}
                      <Tooltip
                        placement="top"
                        label={intl.formatMessage({
                          id: 'admin.help.customcode',
                        })}
                        id="tooltip-description"
                        className="text-left"
                        style={{
                          wordBreak: 'break-word',
                        }}
                      >
                        <div>
                          <InformationIcon />
                        </div>
                      </Tooltip>
                    </Flex>
                  </Flex>
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
  )
}
const selector = formValueSelector(formName)
const formContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  validate,
})(EventForm)

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (props.event) {
    const translation = props.event?.translations
      ? getTranslation(props.event?.translations, state.language.currentLanguage)
      : undefined
    return {
      currentLanguage: state.language.currentLanguage,
      initialValues: {
        id: props.event && props.event.id ? props.event.id : null,
        title: translation ? translation.title : null,
        startAt: props.event && props.event.timeRange ? props.event.timeRange.startAt : null,
        endAt: props.event && props.event.timeRange ? props.event.timeRange.endAt : null,
        body: translation ? translation.body : null,
        bodyUsingJoditWysiwyg: props?.event?.bodyUsingJoditWysiwyg !== false,
        enabled: props.event ? props.event.enabled : null,
        commentable: props.event ? props.event.commentable : null,
        guestListEnabled: props.event ? props.event.guestListEnabled : null,
        maxRegistrations: props.event ? props.event.maxRegistrations : null,
        measurable: props.event ? props.event.isMeasurable : false,
        adminAuthorizeDataTransfer: props.event?.adminAuthorizeDataTransfer || false,
        authorAgreeToUsePersonalDataForEventOnly: props.event?.authorAgreeToUsePersonalDataForEventOnly
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
        districts:
          props?.event?.districts?.edges
            ?.map(edge => edge?.node)
            ?.map(district => ({
              value: district.id,
              label: district.title,
            })) ?? [],
        author:
          props.event && props.event.author
            ? {
                value: props.event.author.id,
                label: props.event.author.displayName,
              }
            : null,
        addressText: props.event && props.event.googleMapsAddress ? props.event.googleMapsAddress.formatted : null,
        addressJson: props.event && props.event.googleMapsAddress ? props.event.googleMapsAddress.json : null,
        translations: props.event && props.event.translations ? props.event.translations : [],
      },
      currentValues: selector(state, 'guestListEnabled', 'link', 'status', 'projects', 'measurable'),
    }
  }

  const organization = props.query.viewer.organizations ? props.query.viewer.organizations[0] : null
  return {
    currentLanguage: state.language.currentLanguage,
    currentValues: selector(state, 'guestListEnabled', 'link', 'status', 'projects', 'measurable'),
    initialValues: {
      authorAgreeToUsePersonalDataForEventOnly: false,
      bodyUsingJoditWysiwyg: true,
      guestListEnabled: false,
      author: {
        value: organization?.id ?? props.query.viewer.id,
        label: organization?.displayName ?? props.query.viewer.displayName,
      },
    },
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(formContainer))
export default createFragmentContainer(container, {
  query: graphql`
    fragment EventForm_query on Query @argumentDefinitions(affiliations: { type: "[ProjectAffiliation!]" }) {
      ...SelectTheme_query
      ...SelectDistrict_query
      viewer {
        ...SelectProject_projectOwner @arguments(affiliations: $affiliations)
        ...SelectStep_projectOwner @arguments(affiliations: $affiliations)
        isAdmin
        isSuperAdmin
        isOnlyProjectAdmin
        id
        displayName
        organizations {
          id
          displayName
          ...SelectProject_projectOwner @arguments(affiliations: $affiliations)
          ...SelectStep_projectOwner @arguments(affiliations: $affiliations)
        }
      }
    }
  `,
  event: graphql`
    fragment EventForm_event on Event {
      id
      bodyUsingJoditWysiwyg
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
        ... on User {
          isAdmin
        }
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
      maxRegistrations
      isMeasurable
      participants {
        totalCount
      }
      districts {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
})
