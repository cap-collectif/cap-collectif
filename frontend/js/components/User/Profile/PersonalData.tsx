import React, { Component } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Alert, Button as ButtonLegacy, Panel, Well } from 'react-bootstrap'
import { connect } from 'react-redux'

import styled from 'styled-components'
import { change, Field, formValueSelector, reduxForm, SubmissionError, unregisterField } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import type { PersonalData_viewer } from '~relay/PersonalData_viewer.graphql'
import '~relay/PersonalData_viewer.graphql'
import AlertForm from '../../Alert/AlertForm'
import type { Dispatch, State } from '~/types'
import UpdateProfilePersonalDataMutation from '../../../mutations/UpdateProfilePersonalDataMutation'
import component from '../../Form/Field'
import DateDropdownPicker from '../../Form/DateDropdownPicker'
import config from '../../../config'
import UserArchiveRequestButton from './UserArchiveRequestButton'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import Text from '~ui/Primitives/Text'
import { styleGuideColors } from '~/utils/colors'
import Popover from '~ds/Popover'
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction'

type RelayProps = {
  viewer: PersonalData_viewer
}
type Props = ReduxFormFormProps &
  RelayProps & {
    intl: IntlShape
    initialValues: Record<string, any>
    currentValues: Record<string, any>
  }
const formName = 'profilePersonalData'
export const occitanieUrl = 'jeparticipe.laregioncitoyenne.fr'
export const occitaniePreprodUrl = 'occitanie-preprod.cap-collectif.com'

const hasAddressData = (viewer: PersonalData_viewer, value: Record<string, any> | null | undefined) => {
  if (!viewer.address && !viewer.zipCode && !viewer.city) {
    return false
  }

  return !(value && !value.address && !value.zipCode && !value.city)
}

const validate = (values: Record<string, any>, props: Props) => {
  const errors: any = {}

  if (props.viewer.firstname) {
    if (!values.firstname || values.firstname.length === 0) {
      errors.firstname = 'fill-or-delete-field'
    }

    if (values.firstname && values.firstname.length <= 2) {
      errors.firstname = 'two-characters-minimum-required'
    }

    if (values.firstname && values.firstname.length > 256) {
      errors.firstname = '256-characters-maximum-required'
    }
  }

  if (props.viewer.lastname) {
    if (!values.lastname || values.lastname.length === 0) {
      errors.lastname = 'fill-or-delete-field'
    }

    if (values.lastname && values.lastname.length <= 2) {
      errors.lastname = 'two-characters-minimum-required'
    }

    if (values.lastname && values.lastname.length > 256) {
      errors.lastname = '256-characters-maximum-required'
    }
  }

  if (props.viewer.phone) {
    if (!values.phone || values.phone.length === 0) {
      errors.phone = 'fill-or-delete-field'
    }

    if (values.phone && typeof values.phone === 'string') {
      let { phone } = values

      if (phone.slice(0, 3) === '+33') {
        phone = phone.replace('+33', '0')
      }

      if (!/^[0-9]+$/.test(phone) || phone.length !== 10) {
        errors.phone = 'profile.constraints.phone.invalid'
      }
    }
  }

  if (props.viewer.postalAddress) {
    if (!values.postalAddress || values.postalAddress.length === 0) {
      errors.postalAddress = 'fill-or-delete-field'
    }
  }
  // @ts-ignore
  if (hasAddressData(props.viewer)) {
    const addressFields = ['address', 'address2', 'city', 'zipCode']
    addressFields.forEach(value => {
      if (value !== 'address2') {
        if (!values[value] || values[value].length === 0) {
          errors[value] = 'fill-or-delete-field'
        }
      }

      if (values[value] && values[value].length <= 2) {
        errors[value] = 'two-characters-minimum-required'
      }

      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required'
      }
    })
  }

  return errors
}

let wLocale = 'fr-FR'

if (config.canUseDOM && window.locale) {
  wLocale = window.locale
} else if (!config.canUseDOM) {
  wLocale = global.locale
}

const onSubmit = (values: Record<string, any>, dispatch: Dispatch, props: Props) => {
  const { intl } = props
  delete values.isFranceConnectAccount
  delete values.postalAddressText
  delete values.userIdentificationCode
  const input = { ...values }

  if (input.phone && input.phone.slice(0, 3) !== '+33') {
    input.phone = `+33${input.phone.charAt(0) === '0' ? input.phone.substring(1) : input.phone}`
  }

  return UpdateProfilePersonalDataMutation.commit({
    input,
  })
    .then(response => {
      if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.user) {
        throw new Error('Mutation "updateProfilePersonalData" failed.')
      }

      const { errorCode } = response.updateProfilePersonalData

      if (errorCode) {
        let phone

        switch (errorCode) {


          case 'PHONE_INVALID_LENGTH':
            phone = intl.formatMessage({
              id: 'phone.validation.length',
            })
            break

          default:
            phone = null
        }

        throw new SubmissionError({
          phone,
        })
      }
    })
    .catch(response => {
      if (response.errors) {
        throw new SubmissionError(response.errors)
      }

      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        })
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({
            id: 'global.error.server.form',
          }),
        })
      }
    })
}

const hasData = (viewer: PersonalData_viewer, formValue: Record<string, any> | null | undefined): boolean => {
  if (
    !viewer.firstname &&
    !viewer.lastname &&
    !viewer.dateOfBirth &&
    !viewer.phone &&
    !viewer.postalAddress &&
    !viewer.address &&
    !viewer.address2 &&
    !viewer.zipCode &&
    !viewer.city &&
    !viewer.gender &&
    !viewer.userIdentificationCode
  ) {
    return false
  }

  return !(
    formValue &&
    !formValue.firstname &&
    !formValue.lastname &&
    !formValue.dateOfBirth &&
    !formValue.phone &&
    !formValue.postalAddress &&
    !formValue.address &&
    !formValue.address2 &&
    !formValue.zipCode &&
    !formValue.city &&
    !formValue.gender &&
    !formValue.userIdentificationCode
  )
}

const PersonnalDataContainer = styled.div`
  .alert-info {
    display: flex;
    .cap-information {
      font-size: 26px;
    }
  }
  #capco_horizontal_form {
    .form-group {
      margin-bottom: 5px;
    }
  }
  #project-participation-collected-data {
    display: flex;
  }
  .code-privacy {
    a,
    a:hover {
      text-decoration: underline;
      color: ${styleGuideColors.gray900};
    }
  }
`
type PersonalDataState = {
  year: number | null | undefined
  month: number | null | undefined
  day: number | null | undefined
}
export const getSsoTradKey = (): string => {
  if (window.location.hostname === occitanieUrl || window.location.hostname === occitaniePreprodUrl){
    return 'data-sso-occitanie'
  }

  return 'data-from-FranceConnect'
}
export const isSsoFcOrOccitanie = (isFranceConnectAccount: boolean) => {
  return (window.location.hostname === occitanieUrl || window.location.hostname === occitaniePreprodUrl) || isFranceConnectAccount
}
export class PersonalData extends Component<Props, PersonalDataState> {
  deleteField = (target: string): void => {
    const { dispatch } = this.props

    if (target.split('-').length > 1) {
      target.split('-').forEach(index => {
        dispatch(unregisterField(formName, index, false))
        dispatch(change(formName, index, null))
      })
      return
    }

    dispatch(unregisterField(formName, target, false))
    dispatch(change(formName, target, null))
  }

  fieldDeletePopover = (target: string) => (
    <Popover trigger={['click']} placement="top">
      <Popover.Trigger>
        <ButtonQuickAction
          className="personal-data-delete-field"
          id={`personal-data-${target}`}
          icon="CIRCLE_CROSS"
          label={<FormattedMessage id="global.delete" />}
          size="sm"
          variantColor="primary"
        />
      </Popover.Trigger>
      <Popover.Content id="delete-field">
        {({ closePopover }) => (
          <>
            <Popover.Header>
              <FormattedMessage id="are-you-sure-you-want-to-delete-this-field" />
            </Popover.Header>
            <Popover.Body>
              <ButtonLegacy
                onClick={() => {
                  this.deleteField(target)

                  if (closePopover) {
                    closePopover()
                  }
                }}
                id="btn-confirm-delete-field"
                bsStyle="danger"
                className="right-bloc btn-block"
              >
                <FormattedMessage id="btn_delete" />
              </ButtonLegacy>
              <ButtonLegacy
                onClick={closePopover}
                id="btn-cancel-delete-field"
                bsStyle="default"
                className="right-block btn-block"
              >
                <FormattedMessage id="global.no" />
              </ButtonLegacy>
            </Popover.Body>
          </>
        )}
      </Popover.Content>
    </Popover>
  )

  render() {
    const {
      viewer,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      currentValues,
      intl,
      change: changeProps,
    } = this.props
    const header = (
      <div className="panel-heading profile-header">
        <h1>
          <FormattedMessage id="data" />
        </h1>
      </div>
    )
    const footer = (
      <div className="col-sm-offset-4">
        <ButtonLegacy disabled={invalid || submitting} type="submit" bsStyle="primary" id="personal-data-form-save">
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
        </ButtonLegacy>
      </div>
    )
    const canDisplaySubmitButton =
      (viewer.isFranceConnectAccount &&
        (viewer.address ||
          viewer.address2 ||
          viewer.city ||
          viewer.zipCode ||
          viewer.userIdentificationCode ||
          viewer.postalAddress ||
          viewer.phone)) ||
      !isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)
    return (
      <PersonnalDataContainer id="personal-data">
        {!hasData(viewer, currentValues) && (
          <Alert bsStyle="info">
            <span className="cap-information col-sm-1 col-md-1" />
            {/** @ts-ignore */}
            <FormattedMessage id="participation-personal-data-identity-verification" className="col-sm-7 col-md-7" />
          </Alert>
        )}
        {hasData(viewer, currentValues) && (
          <Alert bsStyle="info" id="project-participation-collected-data">
            <span className="cap-information col-sm-1 col-md-1" />
            {/** @ts-ignore */}
            <FormattedMessage id="project-participation-collected-data" className="col-sm-11 col-md-11" />
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="form-horizontal">
          <Panel id="capco_horizontal_form">
            <Panel.Heading>{header}</Panel.Heading>
            <Panel.Body>
              {!hasData(viewer, currentValues) && (
                <div
                  className="horizontal_field_with_border_top"
                  style={{
                    border: 0,
                  }}
                >
                  <Well>
                    <FormattedMessage id="no-data" />
                  </Well>
                </div>
              )}
              {hasData(viewer, null) && (
                <div>
                  {hasData(viewer, currentValues) && (
                    <div>
                      {currentValues.gender !== null && (
                        <div className="horizontal_field_with_border_top no-border">
                          <label className="col-sm-3 control-label" htmlFor="personal-data-form-gender">
                            <FormattedMessage id="form.label_gender" />
                          </label>
                          <div>
                            <Field
                              name="gender"
                              component={component}
                              type="select"
                              disabled={isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)}
                              id="personal-data-form-gender"
                              divClassName="col-sm-4"
                            >
                              <option value="MALE">
                                {intl.formatMessage({
                                  id: 'gender.male',
                                })}
                              </option>
                              <option value="FEMALE">
                                {intl.formatMessage({
                                  id: 'gender.female',
                                })}
                              </option>
                              <option value="OTHER">
                                {intl.formatMessage({
                                  id: 'gender.other',
                                })}
                              </option>
                            </Field>
                          </div>
                          {!isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('gender')}</div>
                          )}
                          {isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-6 excerpt mb-10 text-right"
                              style={{
                                marginLeft: 28,
                              }}
                            >
                              <FormattedMessage id={getSsoTradKey()} />
                            </div>
                          )}
                        </div>
                      )}
                      {currentValues.firstname !== null && (
                        <div className="horizontal_field_with_border_top">
                          <label className="col-sm-3 control-label" htmlFor="personal-data-form-firstname">
                            <FormattedMessage id="form.label_firstname" />
                          </label>
                          <div>
                            <Field
                              name="firstname"
                              component={component}
                              disabled={isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)}
                              type="text"
                              id="personal-data-form-firstname"
                              divClassName="col-sm-4"
                            />
                          </div>
                          {!isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('firstname')}</div>
                          )}
                          {isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-6 excerpt mb-10 text-right"
                              style={{
                                marginLeft: 28,
                              }}
                            >
                              <FormattedMessage id={getSsoTradKey()} />
                            </div>
                          )}
                        </div>
                      )}
                      {currentValues.lastname !== null && (
                        <div className="horizontal_field_with_border_top">
                          <label className="col-sm-3 control-label" htmlFor="personal-data-form-lastname">
                            <FormattedMessage id="global.name" />
                          </label>
                          <div>
                            <Field
                              name="lastname"
                              component={component}
                              disabled={isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)}
                              type="text"
                              id="personal-data-form-lastname"
                              divClassName="col-sm-4"
                            />
                          </div>
                          {!isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('lastname')}</div>
                          )}
                          {isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-6 excerpt mb-10 text-right"
                              style={{
                                marginLeft: 28,
                              }}
                            >
                              <FormattedMessage id={getSsoTradKey()} />
                            </div>
                          )}
                        </div>
                      )}
                      { currentValues.dateOfBirth !== null && (
                        <div>
                          <div className="horizontal_field_with_border_top">
                            <Field
                              name="dateOfBirth"
                              id="dateOfBirth"
                              component={DateDropdownPicker}
                              disabled={isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)}
                              locale={wLocale}
                              dayId="personal-data-date-of-birth-day"
                              monthId="personal-data-date-of-birth-month"
                              yearId="personal-data-date-of-birth-year"
                              label={<FormattedMessage id="form.label_date_of_birth" />}
                              componentId="personal-data-date-of-birth"
                              labelClassName="col-sm-3 control-label"
                              divClassName="col-sm-6"
                            />
                          </div>
                          {!isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-2 btn--delete"
                              style={{
                                marginBottom: 15,
                              }}
                            >
                              {this.fieldDeletePopover('dateOfBirth')}
                            </div>
                          )}
                          {isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-6 excerpt mb-10 text-right"
                              style={{
                                marginLeft: 28,
                              }}
                            >
                              <FormattedMessage id={getSsoTradKey()} />
                            </div>
                          )}
                        </div>
                      )}
                      {currentValues.birthPlace !== null && (
                        <div className="horizontal_field_with_border_top">
                          <label className="col-sm-3 control-label" htmlFor="personal-data-form-birthPlace">
                            <FormattedMessage id="birthPlace" />
                          </label>
                          <div>
                            <Field
                              name="birthPlace"
                              component={component}
                              disabled={isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount)}
                              type="text"
                              id="personal-data-form-birthPlace"
                              divClassName="col-sm-4"
                            />
                          </div>
                          {!isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('birthPlace')}</div>
                          )}
                          {isSsoFcOrOccitanie(!!viewer.isFranceConnectAccount) && (
                            <div
                              className="col-sm-6 excerpt mb-10 text-right"
                              style={{
                                marginLeft: 28,
                              }}
                            >
                              <FormattedMessage id={getSsoTradKey()} />
                            </div>
                          )}
                        </div>
                      )}
                      {hasAddressData(viewer, currentValues) && (
                        <div className="horizontal_field_with_border_top">
                          {!isSsoFcOrOccitanie(false) && (
                            <div className="col-sm-11 btn--delete">
                              {this.fieldDeletePopover('address-address2-city-zipCode')}
                            </div>
                          )}
                          {currentValues.address !== null && (
                            <div className="personal-data-address">
                              <label className="col-sm-3 control-label" htmlFor="personal-data-form-address">
                                <FormattedMessage id="form.label_address" />
                              </label>
                              <div>
                                <Field
                                  name="address"
                                  component={component}
                                  disabled={isSsoFcOrOccitanie(false)}
                                  type="text"
                                  id="personal-data-form-address"
                                  divClassName="col-sm-7"
                                />
                              </div>
                              {isSsoFcOrOccitanie(false) && (
                                <div
                                  className="col-sm-6 excerpt mb-10 text-right"
                                  style={{
                                    marginLeft: 28,
                                  }}
                                >
                                  <FormattedMessage id={getSsoTradKey()} />
                                </div>
                              )}
                            </div>
                          )}
                          {currentValues.address2 !== null && (
                            <div className="personal-data-address">
                              <label className="col-sm-3 control-label" htmlFor="personal-data-form-address2">
                                <FormattedMessage id="form.label_address2" />
                              </label>
                              <div>
                                <Field
                                  name="address2"
                                  component={component}
                                  disabled={isSsoFcOrOccitanie(false)}
                                  type="text"
                                  id="personal-data-form-address2"
                                  divClassName="col-sm-7"
                                />
                              </div>
                              {isSsoFcOrOccitanie(false) && (
                                <div
                                  className="col-sm-6 excerpt mb-10 text-right"
                                  style={{
                                    marginLeft: 28,
                                  }}
                                >
                                  <FormattedMessage id={getSsoTradKey()} />
                                </div>
                              )}
                            </div>
                          )}
                          {currentValues.city !== null && (
                            <div className="personal-data-address">
                              <label className="col-sm-3 control-label" htmlFor="personal-data-form-city">
                                <FormattedMessage id="form.label_city" />
                              </label>
                              <div>
                                <Field
                                  name="city"
                                  component={component}
                                  disabled={isSsoFcOrOccitanie(false)}
                                  type="text"
                                  id="personal-data-form-city"
                                  divClassName="col-sm-7"
                                />
                              </div>
                              {isSsoFcOrOccitanie(false) && (
                                <div
                                  className="col-sm-6 excerpt mb-10 text-right"
                                  style={{
                                    marginLeft: 28,
                                  }}
                                >
                                  <FormattedMessage id={getSsoTradKey()} />
                                </div>
                              )}
                            </div>
                          )}

                          {currentValues.zipCode !== null && (
                            <div className="personal-data-address">
                              <label className="col-sm-3 control-label" htmlFor="personal-data-form-zip-code">
                                <FormattedMessage id="form.label_zip_code" />
                              </label>
                              <div>
                                <Field
                                  name="zipCode"
                                  component={component}
                                  disabled={isSsoFcOrOccitanie(false)}
                                  type="text"
                                  id="personal-data-form-zip-code"
                                  divClassName="col-sm-4"
                                />
                              </div>
                              {isSsoFcOrOccitanie(false) && (
                                <div
                                  className="col-sm-6 excerpt mb-10 text-right"
                                  style={{
                                    marginLeft: 28,
                                  }}
                                >
                                  <FormattedMessage id={getSsoTradKey()} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {currentValues.phone !== null && (
                        <div>
                          <div className="horizontal_field_with_border_top">
                            <label className="col-sm-3 control-label" htmlFor="personal-data-form-phone">
                              <FormattedMessage id="form.label_phone" />
                            </label>
                            <div>
                              <Field
                                name="phone"
                                component={component}
                                type="text"
                                disabled={isSsoFcOrOccitanie(false)}
                                id="personal-data-form-phone"
                                divClassName="col-sm-4 col-xs-12"
                                addonBefore="France +33"
                              />
                            </div>
                            {!isSsoFcOrOccitanie(false) && (
                              <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('phone')}</div>
                            )}
                            {isSsoFcOrOccitanie(false) && (
                              <div
                                className="col-sm-6 excerpt mb-10 text-right"
                                style={{
                                  marginLeft: 28,
                                }}
                              >
                                <FormattedMessage id={getSsoTradKey()} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {currentValues.postalAddress !== null && (
                        <div>
                          <div className="horizontal_field_with_border_top">
                            <label className="col-sm-3 control-label" htmlFor="personal-data-form-postal-address">
                              <FormattedMessage id="form.label-postal-Address" />
                            </label>
                            <div>
                              <Field
                                id="personal-data-form-postal-address"
                                divClassName="col-sm-4 col-xs-12"
                                name="postalAddressText"
                                component={component}
                                type="address"
                                addressProps={{
                                  getAddress: (addressComplete: AddressComplete | null | undefined) =>
                                    changeProps(
                                      'postalAddress',
                                      addressComplete ? JSON.stringify([addressComplete]) : addressComplete,
                                    ),
                                  allowReset: false,
                                }}
                                disabled={isSsoFcOrOccitanie(false)}
                              />
                            </div>
                            {!isSsoFcOrOccitanie(false) && (
                              <div className="col-sm-4 btn--delete">{this.fieldDeletePopover('postalAddress')}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {!!currentValues.userIdentificationCode && (
                        <div className="horizontal_field_with_border_top">
                          <label className="col-sm-3 control-label" htmlFor="personal-data-form-code">
                            <FormattedMessage id="identification_code" />
                          </label>
                          <div>
                            <Field
                              id="personal-data-form-code"
                              divClassName="col-sm-4 col-xs-12"
                              name="userIdentificationCode"
                              component={component}
                              type="text"
                              disabled
                            />
                            <Text
                              as="div"
                              className="col-sm-4 col-xs-12 code-privacy"
                              marginLeft="190px"
                              width="max-content"
                              color={styleGuideColors.gray900}
                            >
                              <FormattedHTMLMessage id="verificationCodeHelp" />
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <>
                    <AlertForm
                      valid={valid}
                      invalid={invalid}
                      errorMessage={error}
                      submitSucceeded={submitSucceeded}
                      submitFailed={submitFailed}
                      submitting={submitting}
                    />
                  </>
                </div>
              )}
            </Panel.Body>
            {canDisplaySubmitButton && <Panel.Footer>{footer}</Panel.Footer>}
          </Panel>
        </form>
        <Panel>
          <Panel.Body>
            <h3 className="page-header" style={{ marginTop: 0 }}>
              <FormattedMessage id="label_export_download" />
            </h3>
            <div className="horizontal_field_with_border_top">
              <span className="col-sm-3 control-label">
                <FormattedMessage id="your-data" />
              </span>
              <div className="col-sm-9">
                <UserArchiveRequestButton viewer={viewer} />
                {viewer.isArchiveReady && (
                  <p className="excerpt">
                    <FormattedMessage id="help-text-data-download-button" />
                  </p>
                )}
                <p className="excerpt mt-15">
                  <FormattedMessage id="data-copy-help-text" />
                </p>
              </div>
            </div>
          </Panel.Body>
        </Panel>
      </PersonnalDataContainer>
    )
  }
}
const selector = formValueSelector(formName)
const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(PersonalData)

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    firstname: props.viewer.firstname ? props.viewer.firstname : null,
    lastname: props.viewer.lastname ? props.viewer.lastname : null,
    postalAddressText: props.viewer.postalAddress ? props.viewer.postalAddress.formatted : null,
    postalAddress: props.viewer.postalAddress ? props.viewer.postalAddress.json : null,
    address: props.viewer.address ? props.viewer.address : null,
    address2: props.viewer.address2 ? props.viewer.address2 : null,
    city: props.viewer.city ? props.viewer.city : null,
    zipCode: props.viewer.zipCode ? props.viewer.zipCode : null,
    phone: props.viewer.phone ? props.viewer.phone : null,
    gender: props.viewer.gender ? props.viewer.gender : null,
    dateOfBirth: props.viewer.dateOfBirth ? props.viewer.dateOfBirth : null,
    birthPlace: props.viewer.birthPlace ? props.viewer.birthPlace : null,
    userIdentificationCode: props.viewer.userIdentificationCode ? props.viewer.userIdentificationCode : null,
    isFranceConnectAccount: props.viewer.isFranceConnectAccount || false,
  },
  currentValues: selector(
    state,
    'firstname',
    'lastname',
    'gender',
    'dateOfBirth',
    'postalAddress',
    'address',
    'address2',
    'city',
    'zipCode',
    'phone',
    'birthPlace',
    'userIdentificationCode',
  ),
})

// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  viewer: graphql`
    fragment PersonalData_viewer on User {
      firstname
      lastname
      dateOfBirth
      phone
      postalAddress {
        formatted
        json
      }
      address
      address2
      zipCode
      city
      gender
      isArchiveReady
      birthPlace
      isFranceConnectAccount
      userIdentificationCode
      ...UserArchiveRequestButton_viewer
    }
  `,
})
