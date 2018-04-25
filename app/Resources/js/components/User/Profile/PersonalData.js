// @flow
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import {
  Alert,
  Well,
  Panel,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import {connect, type MapStateToProps} from 'react-redux';
import {YearPicker, MonthPicker, DayPicker} from 'react-dropdown-date';
import {
  reduxForm,
  type FormProps,
  Field,
  SubmissionError,
  unregisterField,
  change,
  formValueSelector
} from 'redux-form';
import {FormattedMessage, injectIntl, type IntlShape} from 'react-intl';
import type PersonalData_user from './__generated__/PersonalData_user.graphql';
import AlertForm from '../../Alert/AlertForm';
import type {Dispatch, State} from '../../../types';
import UpdateProfilePersonalDataMutation from '../../../mutations/UpdateProfilePersonalDataMutation';
import component from "../../Form/Field";
import PhoneModal from "../Phone/PhoneModal";

type RelayProps = { personalDataForm: PersonalData_user };
type Props = FormProps &
  RelayProps & {
  user: PersonalData_user,
  intl: IntlShape,
  initialValues: Object,
  hasValue: Object,
};

const formName = 'profilePersonalData';

const hasAddressData = (user: PersonalData_user, value: ?Object) => {
  if (!user.address && !user.zipCode && !user.city) {
    return false;
  }
  if (value) {
    if (!value.address && !value.zipCode && !value.city) {
      return false;
    }
  }

  return true;
};

const validate = (values: Object, props: Props) => {
  const errors = {};
  if (props.user.firstname) {
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
  if (props.user.lastname) {
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
  if (props.user.phone) {
    if (!values.phone || values.lastname.length === 0) {
      errors.phone = 'fill-or-delete-field';
    }
    if (values.phone && values.phone.length <= 2) {
      errors.phone = 'two-characters-minimum-required';
    }
    if (values.phone && values.phone.length > 256) {
      errors.phone = '256-characters-maximum-required';
    }
  }

  if (hasAddressData(props.user)) {
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
const locale = window.locale;

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
  const input = {
    ...values,
    userId: props.user.id
  };

  return UpdateProfilePersonalDataMutation.commit({input})
    .then(response => {
      if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.viewer) {
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
          _error: intl.formatMessage({id: 'global.error.server.form'}),
        });
      }
    });
};
const hasData = (user: PersonalData_user, formValue: ?Object): boolean => {
  if (
    !user.firstname &&
    !user.lastname &&
    !user.dateOfBirth &&
    !user.phone &&
    !user.address &&
    !user.address2 &&
    !user.zipCode &&
    !user.city &&
    !user.gender
  ) {
    return false;
  }

  if (formValue &&
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

const getDay = (date: string): number => {
  let day = date.substr(8, 2);
  day = day[0] === 0 ? day[1] : day;

  return parseInt(day, 10);
};

const getMonth = (date: string): number => {
  let month = date.substr(5, 2);
  month = month[0] === 0 ? month[1] : month;
  month = parseInt(month, 10);

  return month - 1;
};

const getYear = (date: string): number => {
  const year = date.substr(0, 4);

  return parseInt(year, 10);
};

type PersonalDataState = {
  year: ?number,
  month: ?number,
  day: ?number,
  showPhoneModal: boolean,
};

export class PersonalData extends Component<Props, PersonalDataState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showPhoneModal: false,
    };
    if (props.user && props.user.dateOfBirth) {
      this.state = {
        ...this.state,
        year: getYear(props.user.dateOfBirth),
        month: getMonth(props.user.dateOfBirth),
        day: getDay(props.user.dateOfBirth),
      };
    }
  }

  setDate = () => {
    if (!this.state.year || !this.state.month || !this.state.day) {
      return;
    }
    const month = parseInt(this.state.month, 10) + 1;
    this.props.dispatch(
      change(
        formName,
        'dateOfBirth',
        // $FlowFixMe
        `${this.state.year}-${month}-${this.state.day}`
      )
    );
  };

  openPhoneModal = () => {
    this.setState({showPhoneModal: true});
  };

  closePhoneModal = () => {
    this.setState({showPhoneModal: false});
  };

  deleteField = (e: Event): void => {
    // $FlowFixMe
    const target = e.currentTarget.target;
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

  render() {
    const {
      user,
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      hasValue
    } = this.props;
    return (
      <div id="personal-data">
        {!hasData(user, hasValue) && (
          <Alert bsStyle="info">
            <span className="cap-information col-sm-1 col-md-1"/>
            <FormattedMessage
              id="participation-personal-data-identity-verification"
              className="col-sm-7 col-md-7"
            />
          </Alert>
        )}
        {hasData(user, hasValue) && (
          <Alert bsStyle="info" id="project-participation-collected-data">
            <span className="cap-information col-sm-1 col-md-1"/>
            <FormattedMessage
              id="project-participation-collected-data"
              className="col-sm-11 col-md-11"
            />
          </Alert>
        )}
        <Panel id="personal-data-form">
          <h2>
            <FormattedMessage id="personal-data"/>
          </h2>
          {!hasData(user, hasValue) && (
            <div className="personal_data_field">
              <Well>
                <FormattedMessage id="no-data"/>
              </Well>
            </div>
          )}
          {hasData(user, null) && (
            <div>
              <form onSubmit={handleSubmit} className="form-horizontal">
                {hasData(user, hasValue) && (
                  <div>
                    {hasValue.firstname && (
                      <div className="personal_data_field">
                        <label className="col-sm-3 control-label">
                          <FormattedMessage id="form.label_firstname"/>
                        </label>
                        <div>
                          <Field
                            name="firstname"
                            component={component}
                            type="text"
                            id="personal-data-form-firstname"
                            divClassName="col-sm-5"
                          />
                        </div>
                        <div className="col-sm-2">
                          <a className="personal-data-delete-field" onClick={(e) => {
                            this.deleteField(e);
                          }} target="firstname"
                             id="personal-data-firstname">
                            <i className="icon cap-ios-close"></i>
                          </a>
                        </div>
                      </div>
                    )}
                    {hasValue.lastname && (
                      <div className="personal_data_field">
                        <label className="col-sm-3 control-label">
                          <FormattedMessage id="form.label_lastname"/>
                        </label>
                        <div>
                          <Field
                            name="lastname"
                            component={component}
                            type="text"
                            id="personal-data-form-lastname"
                            divClassName="col-sm-7"
                          />
                        </div>
                        <div className="col-sm-2">
                          <a className="personal-data-delete-field" onClick={(e) => {
                            this.deleteField(e);
                          }} target="lastname"
                             id="personal-data-lastname">
                            <i className="icon cap-ios-close"></i>
                          </a>
                        </div>
                      </div>
                    )}
                    {hasValue.gender && (
                      <div className="personal_data_field">
                        <label className="col-sm-3 control-label">
                          <FormattedMessage id="form.label_gender"/>
                        </label>
                        <div>
                          <Field
                            name="gender"
                            component={component}
                            type="select"
                            id="personal-data-form-gender"
                            divClassName="col-sm-7"
                          >
                            <option value="MALE">
                              <FormattedMessage id="gender.male"/>
                            </option>
                            <option value="FEMALE">
                              <FormattedMessage id="gender.female"/>
                            </option>
                            <option value="OTHER">
                              <FormattedMessage id="gender.other"/>
                            </option>
                          </Field>
                        </div>
                        <div className="col-sm-2">
                          <a className="personal-data-delete-field" onClick={(e) => {
                            this.deleteField(e);
                          }} target="gender"
                             id="personal-data-gender">
                            <i className="icon cap-ios-close"></i>
                          </a>
                        </div>
                      </div>
                    )}
                    {hasValue.dateOfBirth && (
                      <div className="personal_data_field">
                        <label className="col-sm-3 control-label">
                          <FormattedMessage id="form.label_date_of_birth"/>
                        </label>
                        <div className="col-sm-8" id="personal-data-date-of-birth">
                          <Col sm={3} md={3} id="personal-data-date-of-birth-day">
                            <DayPicker
                              defaultValue={'Jour'}
                              year={this.state.year}
                              month={this.state.month}
                              value={this.state.day}
                              onChange={day => {
                                this.setState({day}, () => {
                                  this.setDate()
                                });
                              }}
                              id={'day'}
                              name={'day'}
                              classes={'form-control'}
                              optionClasses={'option classes'}
                            />
                          </Col>
                          <Col sm={3} md={3}>
                            <MonthPicker
                              defaultValue={'Mois'}
                              year={this.state.year}
                              value={this.state.month}
                              onChange={month => {
                                this.setState({month}, () => {
                                  this.setDate()
                                });
                              }}
                              locale={locale.substr(3, 5)}
                              id={'month'}
                              name={'month'}
                              classes={'form-control'}
                              optionClasses={'option classes'}
                            />
                          </Col>
                          <Col sm={3} md={3}>
                            <YearPicker
                              defaultValue={'Année'}
                              value={this.state.year}
                              onChange={year => {
                                this.setState({year}, () => {
                                  this.setDate()
                                });

                              }}
                              id={'year'}
                              name={'year'}
                              classes={'form-control'}
                              optionClasses={'option classes'}
                            />
                          </Col>
                          <div className="col-sm-2">
                            <a className="personal-data-delete-field" onClick={(e) => {
                              this.deleteField(e);
                            }} target="dateOfBirth"
                               id="personal-data-dateOfBirth">
                              <i className="icon cap-ios-close"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    {hasAddressData(user, hasValue) && (
                      <div className="personal_data_field">
                        <div className="col-sm-2" style={{float: 'right'}}>
                          <a className="personal-data-delete-field" onClick={(e) => {
                            this.deleteField(e);
                          }} target="address-address2-city-zipCode"
                             id="personal-data-address-address2-city-zipCode">
                            <i className="icon cap-ios-close"></i>
                          </a>
                        </div>
                        {hasValue.address && (
                          <div className="personal-data-address">
                            <label className="col-sm-3 control-label">
                              <FormattedMessage id="form.label_address"/>
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
                        {hasValue.address2 && (
                          <div className="personal-data-address">
                            <label className="col-sm-3 control-label">
                              <FormattedMessage id="form.label_address2"/>
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
                        {hasValue.city && (
                          <div className="personal-data-address">
                            <label className="col-sm-3 control-label">
                              <FormattedMessage id="form.label_city"/>
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
                        {hasValue.zipCode && (
                          <div className="personal-data-address">
                            <label className="col-sm-3 control-label">
                              <FormattedMessage id="form.label_zip_code"/>
                            </label>
                            <div>
                              <Field
                                name="zipCode"
                                component={component}
                                type="text"
                                id="personal-data-form-zip-code"
                                divClassName="col-sm-7"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {hasValue.phone && (
                      <div>
                        <div className="personal_data_field">
                          <label className="col-sm-3 control-label">
                            <FormattedMessage id="form.label_phone"/>
                          </label>
                          <div>
                            <Field
                              name="phone"
                              component={component}
                              type="text"
                              id="personal-data-form-phone"
                              divClassName="col-sm-7"
                              addonBefore="France +33"
                            />
                            {user.phoneConfirmed && (
                              <div>
                                <span style={{marginLeft: '10px'}}>
                                  <Button onClick={() => {
                                    this.openPhoneModal();
                                  }}>
                                    <FormattedMessage id="phone.checked"/>
                                  </Button>
                                </span>
                                <PhoneModal pristine={pristine} show={this.state.showPhoneModal} onClose={() => {
                                  this.closePhoneModal();
                                }}/>
                              </div>
                            )}
                          </div>
                          <div className="col-sm-2">
                            <a className="personal-data-delete-field" onClick={(e) => {
                              this.deleteField(e);
                            }} target="phone"
                               id="personal-data-phone">
                              <i className="icon cap-ios-close"></i>
                            </a>
                          </div>

                        </div>
                        {user.phoneConfirmed && (
                          <div>
                            <strong>
                              <FormattedMessage id="phone.verified"/>
                            </strong>
                          </div>
                        )}
                      </div>

                    )}
                  </div>
                )}
                <div className="personal_data_field">
                  <ButtonToolbar className="box-content__toolbar">
                    <Button
                      disabled={invalid || submitting}
                      type="submit"
                      bsStyle="primary"
                      id="proposal-form-admin-content-save">
                      <FormattedMessage id={submitting ? 'global.loading' : 'global.save'}/>
                    </Button>
                    <AlertForm
                      valid={valid}
                      invalid={invalid}
                      errorMessage={error}
                      submitSucceeded={submitSucceeded}
                      submitFailed={submitFailed}
                      submitting={submitting}
                    />
                  </ButtonToolbar>
                </div>
              </form>
            </div>
          )}
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
    firstname: props.user.firstname ? props.user.firstname : null,
    lastname: props.user.lastname ? props.user.lastname : null,
    address: props.user.address ? props.user.address : null,
    address2: props.user.address2 ? props.user.address2 : null,
    city: props.user.city ? props.user.city : null,
    zipCode: props.user.zipCode ? props.user.zipCode : null,
    phone: props.user.phone ? props.user.phone : null,
    gender: props.user.gender ? props.user.gender : null,
    dateOfBirth: props.user.dateOfBirth ? props.user.dateOfBirth : null,
  },
  hasValue: selector(state, 'firstname', 'lastname', 'gender', 'dateOfBirth', 'address', 'address2', 'city', 'zipCode', 'phone')
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment PersonalData_user on User {
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
      phoneConfirmed
    }
  `,
);
