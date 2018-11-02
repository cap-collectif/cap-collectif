// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  Alert,
  Well,
  Panel,
  ButtonGroup,
  Button,
  Popover,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import {
  reduxForm,
  type FormProps,
  Field,
  SubmissionError,
  unregisterField,
  change,
  formValueSelector,
} from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type PersonalData_viewer from './__generated__/PersonalData_viewer.graphql';
import AlertForm from '../../Alert/AlertForm';
import type { Dispatch, State } from '../../../types';
import UpdateProfilePersonalDataMutation from '../../../mutations/UpdateProfilePersonalDataMutation';
import component from '../../Form/Field';
import DateDropdownPicker from '../../Form/DateDropdownPicker';
import config from '../../../config';
import UserArchiveRequestButton from './UserArchiveRequestButton';

type RelayProps = { personalDataForm: PersonalData_viewer };
type Props = FormProps &
  RelayProps & {
    viewer: PersonalData_viewer,
    intl: IntlShape,
    initialValues: Object,
    currentValues: Object,
  };

const formName = 'profilePersonalData';

const hasAddressData = (viewer: PersonalData_viewer, value: ?Object) => {
  if (!viewer.address && !viewer.zipCode && !viewer.city) {
    return false;
  }
  if (value && !value.address && !value.zipCode && !value.city) {
    return false;
  }

  return true;
};

const validate = (values: Object, props: Props) => {
  const errors = {};
  if (props.viewer.firstname) {
    if (!values.firstname || values.firstname.length === 0) {
      errors.firstname = 'fill-or-delete-field';
    }
    if (values.firstname && values.firstname.length <= 2) {
      errors.firstname = 'two-characters-minimum-required';
    }
    if (values.firstname && values.firstname.length > 256) {
      errors.firstname = '256-characters-maximum-required';
    }
  }
  if (props.viewer.lastname) {
    if (!values.lastname || values.lastname.length === 0) {
      errors.lastname = 'fill-or-delete-field';
    }
    if (values.lastname && values.lastname.length <= 2) {
      errors.lastname = 'two-characters-minimum-required';
    }
    if (values.lastname && values.lastname.length > 256) {
      errors.lastname = '256-characters-maximum-required';
    }
  }
  if (props.viewer.phone) {
    if (!values.phone || values.phone.length === 0) {
      errors.phone = 'fill-or-delete-field';
    }
    if (values.phone && values.phone.length <= 2) {
      errors.phone = 'two-characters-minimum-required';
    }
    if (values.phone && values.phone.length > 256) {
      errors.phone = '256-characters-maximum-required';
    }
  }

  if (hasAddressData(props.viewer)) {
    const addressFields = ['address', 'address2', 'city', 'zipCode'];
    addressFields.forEach(value => {
      if (value !== 'address2') {
        if (!values[value] || values[value].length === 0) {
          errors[value] = 'fill-or-delete-field';
        }
      }
      if (values[value] && values[value].length <= 2) {
        errors[value] = 'two-characters-minimum-required';
      }
      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required';
      }
    });
  }

  return errors;
};

let wLocale = 'fr-FR';

if (config.canUseDOM && window.locale) {
  wLocale = window.locale;
} else if (!config.canUseDOM) {
  wLocale = global.locale;
}

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const input = {
    ...values,
  };

  return UpdateProfilePersonalDataMutation.commit({ input })
    .then(response => {
      if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.user) {
        throw new Error('Mutation "updateProfilePersonalData" failed.');
      }
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};
const hasData = (viewer: PersonalData_viewer, formValue: ?Object): boolean => {
  if (
    !viewer.firstname &&
    !viewer.lastname &&
    !viewer.dateOfBirth &&
    !viewer.phone &&
    !viewer.address &&
    !viewer.address2 &&
    !viewer.zipCode &&
    !viewer.city &&
    !viewer.gender
  ) {
    return false;
  }

  if (
    formValue &&
    !formValue.firstname &&
    !formValue.lastname &&
    !formValue.dateOfBirth &&
    !formValue.phone &&
    !formValue.address &&
    !formValue.address2 &&
    !formValue.zipCode &&
    !formValue.city &&
    !formValue.gender
  ) {
    return false;
  }

  return true;
};

type PersonalDataState = {
  year: ?number,
  month: ?number,
  day: ?number,
};

export class PersonalData extends Component<Props, PersonalDataState> {
  deleteField = (target: string): void => {
    // $FlowFixMe
    if (target.split('-').length > 1) {
      target.split('-').forEach(index => {
        this.props.dispatch(unregisterField(formName, index, false));
        this.props.dispatch(change(formName, index, null));
      });
      return;
    }
    this.props.dispatch(unregisterField(formName, target, false));
    this.props.dispatch(change(formName, target, null));
  };

  popover = (target: string) => (
    <Popover
      placement="top"
      className="in"
      id="delete-field"
      title={<FormattedMessage id="are-you-sure-you-want-to-delete-this-field" />}>
      <Button
        onClick={() => {
          this.deleteField(target);
        }}
        id="btn-confirm-delete-field"
        bsStyle="danger"
        className="right-bloc btn-block">
        {<FormattedMessage id="btn_delete" />}
      </Button>
      <Button
        onClick={() => {
          this.refs[target].hide();
        }}
        id="btn-cancel-delete-field"
        bsStyle="default"
        className="right-block btn-block">
        {<FormattedMessage id="global.no" />}
      </Button>
    </Popover>
  );

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
    } = this.props;

    const tooltipDelete = (
      <Tooltip id="tooltip">
        <FormattedMessage id="global.delete" />
      </Tooltip>
    );

    const header = (
      <div className="panel-heading profile-header">
        <h1>
          <FormattedMessage id="data" />
        </h1>
      </div>
    );

    const footer = (
      <div className="col-sm-offset-4">
        <Button
          disabled={invalid || submitting}
          type="submit"
          bsStyle="primary"
          id="personal-data-form-save">
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
        </Button>
      </div>
    );

    return (
      <div id="personal-data">
        {!hasData(viewer, currentValues) && (
          <Alert bsStyle="info">
            <span className="cap-information col-sm-1 col-md-1" />
            <FormattedMessage
              id="participation-personal-data-identity-verification"
              className="col-sm-7 col-md-7"
            />
          </Alert>
        )}
        {hasData(viewer, currentValues) && (
          <Alert bsStyle="info" id="project-participation-collected-data">
            <span className="cap-information col-sm-1 col-md-1" />
            <FormattedMessage
              id="project-participation-collected-data"
              className="col-sm-11 col-md-11"
            />
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="form-horizontal">
          <Panel id="capco_horizontal_form">
            <Panel.Heading>{header}</Panel.Heading>
            <Panel.Body>
              <h2 className="page-header">
                <FormattedMessage id="personal-data" />
              </h2>
              {!hasData(viewer, currentValues) && (
                <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                  <Well>
                    <FormattedMessage id="no-data" />
                  </Well>
                </div>
              )}
              {hasData(viewer, null) && (
                <div>
                  {hasData(viewer, currentValues) && (
                    <div>
                      {currentValues.firstname !== null && (
                        <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                          <label
                            className="col-sm-3 control-label"
                            htmlFor="personal-data-form-firstname">
                            <FormattedMessage id="form.label_firstname" />
                          </label>
                          <div>
                            <Field
                              name="firstname"
                              component={component}
                              type="text"
                              id="personal-data-form-firstname"
                              divClassName="col-sm-4"
                            />
                          </div>
                          <div className="col-sm-4 btn--delete">
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              rootClose
                              ref="firstname"
                              overlay={this.popover('firstname')}>
                              <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                <span
                                  className="personal-data-delete-field"
                                  id="personal-data-firstname">
                                  <i className="icon cap-ios-close" />
                                </span>
                              </OverlayTrigger>
                            </OverlayTrigger>
                          </div>
                        </div>
                      )}
                      {currentValues.lastname !== null && (
                        <div className="horizontal_field_with_border_top">
                          <label
                            className="col-sm-3 control-label"
                            htmlFor="personal-data-form-lastname">
                            <FormattedMessage id="form.label_lastname" />
                          </label>
                          <div>
                            <Field
                              name="lastname"
                              component={component}
                              type="text"
                              id="personal-data-form-lastname"
                              divClassName="col-sm-4"
                            />
                          </div>
                          <div className="col-sm-4 btn--delete">
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              ref="lastname"
                              overlay={this.popover('lastname')}>
                              <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                <span
                                  className="personal-data-delete-field"
                                  id="personal-data-lastname">
                                  <i className="icon cap-ios-close" />
                                </span>
                              </OverlayTrigger>
                            </OverlayTrigger>
                          </div>
                        </div>
                      )}
                      {currentValues.gender !== null && (
                        <div className="horizontal_field_with_border_top">
                          <label
                            className="col-sm-3 control-label"
                            htmlFor="personal-data-form-gender">
                            <FormattedMessage id="form.label_gender" />
                          </label>
                          <div>
                            <Field
                              name="gender"
                              component={component}
                              type="select"
                              id="personal-data-form-gender"
                              divClassName="col-sm-4">
                              <option value="MALE">
                                {intl.formatMessage({ id: 'gender.male' })}
                              </option>
                              <option value="FEMALE">
                                {intl.formatMessage({ id: 'gender.female' })}
                              </option>
                              <option value="OTHER">
                                {intl.formatMessage({ id: 'gender.other' })}
                              </option>
                            </Field>
                          </div>
                          <div className="col-sm-4 btn--delete">
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              rootClose
                              ref="gender"
                              overlay={this.popover('gender')}>
                              <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                <span
                                  className="personal-data-delete-field"
                                  id="personal-data-gender">
                                  <i className="icon cap-ios-close" />
                                </span>
                              </OverlayTrigger>
                            </OverlayTrigger>
                          </div>
                        </div>
                      )}
                      {currentValues.dateOfBirth !== null && (
                        <div>
                          <div className="horizontal_field_with_border_top">
                            <Field
                              name="dateOfBirth"
                              id="dateOfBirth"
                              component={DateDropdownPicker}
                              locale={wLocale}
                              dayDefaultValue="Jour"
                              monthDefaultValue="Mois"
                              yearDefaultValue="Année"
                              dayId="personal-data-date-of-birth-day"
                              monthId="personal-data-date-of-birth-month"
                              yearId="personal-data-date-of-birth-year"
                              label="form.label_date_of_birth"
                              componentId="personal-data-date-of-birth"
                              labelClassName="col-sm-3 control-label"
                              divClassName="col-sm-6"
                            />
                          </div>
                          <div className="col-sm-2 btn--delete" style={{ marginBottom: 15 }}>
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              rootClose
                              ref="dateOfBirth"
                              overlay={this.popover('dateOfBirth')}>
                              <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                <span
                                  className="personal-data-delete-field"
                                  id="personal-data-dateOfBirth">
                                  <i className="icon cap-ios-close" />
                                </span>
                              </OverlayTrigger>
                            </OverlayTrigger>
                          </div>
                        </div>
                      )}
                      {hasAddressData(viewer, currentValues) && (
                        <div className="horizontal_field_with_border_top">
                          <div className="col-sm-11 btn--delete">
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              rootClose
                              ref="address-address2-city-zipCode"
                              overlay={this.popover('address-address2-city-zipCode')}>
                              <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                <span
                                  className="personal-data-delete-field"
                                  id="personal-data-address-address2-city-zipCode">
                                  <i className="icon cap-ios-close" />
                                </span>
                              </OverlayTrigger>
                            </OverlayTrigger>
                          </div>
                          {currentValues.address !== null && (
                            <div className="personal-data-address">
                              <label
                                className="col-sm-3 control-label"
                                htmlFor="personal-data-form-address">
                                <FormattedMessage id="form.label_address" />
                              </label>
                              <div>
                                <Field
                                  name="address"
                                  component={component}
                                  type="text"
                                  id="personal-data-form-address"
                                  divClassName="col-sm-7"
                                />
                              </div>
                            </div>
                          )}
                          {currentValues.address2 !== null && (
                            <div className="personal-data-address">
                              <label
                                className="col-sm-3 control-label"
                                htmlFor="personal-data-form-address2">
                                <FormattedMessage id="form.label_address2" />
                              </label>
                              <div>
                                <Field
                                  name="address2"
                                  component={component}
                                  type="text"
                                  id="personal-data-form-address2"
                                  divClassName="col-sm-7"
                                />
                              </div>
                            </div>
                          )}
                          {currentValues.city !== null && (
                            <div className="personal-data-address">
                              <label
                                className="col-sm-3 control-label"
                                htmlFor="personal-data-form-city">
                                <FormattedMessage id="form.label_city" />
                              </label>
                              <div>
                                <Field
                                  name="city"
                                  component={component}
                                  type="text"
                                  id="personal-data-form-city"
                                  divClassName="col-sm-7"
                                />
                              </div>
                            </div>
                          )}
                          {currentValues.zipCode !== null && (
                            <div className="personal-data-address">
                              <label
                                className="col-sm-3 control-label"
                                htmlFor="personal-data-form-zip-code">
                                <FormattedMessage id="form.label_zip_code" />
                              </label>
                              <div>
                                <Field
                                  name="zipCode"
                                  component={component}
                                  type="text"
                                  id="personal-data-form-zip-code"
                                  divClassName="col-sm-4"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {currentValues.phone !== null && (
                        <div>
                          <div className="horizontal_field_with_border_top">
                            <label
                              className="col-sm-3 control-label"
                              htmlFor="personal-data-form-phone">
                              <FormattedMessage id="form.label_phone" />
                            </label>
                            <div>
                              <Field
                                name="phone"
                                component={component}
                                type="text"
                                id="personal-data-form-phone"
                                divClassName="col-sm-4 col-xs-12"
                                addonBefore="France +33"
                              />
                            </div>
                            <div className="col-sm-4 btn--delete">
                              <OverlayTrigger
                                trigger="click"
                                placement="top"
                                rootClose
                                ref="phone"
                                overlay={this.popover('phone')}>
                                <OverlayTrigger placement="top" overlay={tooltipDelete}>
                                  <span className="personal-data-delete-field" id="phone">
                                    <i className="icon cap-ios-close" />
                                  </span>
                                </OverlayTrigger>
                              </OverlayTrigger>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="horizontal_field_with_border_top">
                    <div className="col-sm-3" />
                    <ButtonGroup className="col-sm-4 pl-0">
                      <AlertForm
                        valid={valid}
                        invalid={invalid}
                        errorMessage={error}
                        submitSucceeded={submitSucceeded}
                        submitFailed={submitFailed}
                        submitting={submitting}
                      />
                    </ButtonGroup>
                  </div>
                </div>
              )}
            </Panel.Body>
            <Panel.Footer>{footer}</Panel.Footer>
          </Panel>
        </form>
        <Panel>
          <Panel.Body>
            <h2 className="page-header">
              <FormattedMessage id="data-export" />
            </h2>
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
                <p className="excerpt">
                  <FormattedMessage id="data-copy-help-text" />
                </p>
              </div>
            </div>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

const selector = formValueSelector(formName);

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(PersonalData);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  initialValues: {
    firstname: props.viewer.firstname ? props.viewer.firstname : null,
    lastname: props.viewer.lastname ? props.viewer.lastname : null,
    address: props.viewer.address ? props.viewer.address : null,
    address2: props.viewer.address2 ? props.viewer.address2 : null,
    city: props.viewer.city ? props.viewer.city : null,
    zipCode: props.viewer.zipCode ? props.viewer.zipCode : null,
    phone: props.viewer.phone ? props.viewer.phone : null,
    gender: props.viewer.gender ? props.viewer.gender : null,
    dateOfBirth: props.viewer.dateOfBirth ? props.viewer.dateOfBirth : null,
  },
  currentValues: selector(
    state,
    'firstname',
    'lastname',
    'gender',
    'dateOfBirth',
    'address',
    'address2',
    'city',
    'zipCode',
    'phone',
  ),
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment PersonalData_viewer on User {
      id
      firstname
      lastname
      dateOfBirth
      phone
      address
      address2
      zipCode
      city
      gender
      email
      phoneConfirmed
      isArchiveReady
      ...UserArchiveRequestButton_viewer
    }
  `,
);
