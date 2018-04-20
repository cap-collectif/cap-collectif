// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  Alert,
  Well,
  Panel,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
import { reduxForm, type FormProps, SubmissionError } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type PersonalData_user from './__generated__/PersonalData_user.graphql';
import AlertForm from '../../Alert/AlertForm';
import type { Dispatch, State } from '../../../types';
import UpdateProfilePersonalDataMutation from '../../../mutations/UpdateProfilePersonalDataMutation';

type RelayProps = { personalDataForm: PersonalData_user };
type Props = FormProps &
  RelayProps & {
    user: PersonalData_user,
    personalDataForm: PersonalData_user,
    intl: IntlShape,
  };

const formName = 'profilePersonalData';

const hasAddressData = (user: PersonalData_user) => {
  if (!user.address && !user.zipCode && !user.city) {
    return false;
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
  const { intl } = props;
  const input = {
    ...values,
    id: undefined,
    proposalFormId: props.proposalForm.id,
  };

  console.log(input);

  return UpdateProfilePersonalDataMutation.commit({ input })
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
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

type PersonalDataState = {
  year: ?number,
  month: ?number,
  day: ?number,
};

export class PersonalData extends Component<Props, PersonalDataState> {
  constructor(props: Props) {
    super(props);
    if (props.user && props.user.dateOfBirth) {
      this.state = {
        year: this.getYear(props.user.dateOfBirth),
        month: this.getMonth(props.user.dateOfBirth),
        day: this.getDay(props.user.dateOfBirth),
      };
    }
  }

  getDay(date: string): number {
    let day = date.substr(8, 2);
    day = day[0] === 0 ? day[1] : day;

    return parseInt(day, 10);
  }

  getMonth(date: string): number {
    let month = date.substr(5, 2);
    month = month[0] === 0 ? month[1] : month;
    month = parseInt(month, 10);

    return month - 1;
  }

  getYear(date: string): number {
    const year = date.substr(0, 4);

    return parseInt(year, 10);
  }

  hasData(user: PersonalData_user): boolean {
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

    return true;
  }

  render() {
    const {
      user,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      dirty,
      handleSubmit,
      submitting,
      error,
    } = this.props;

    return (
      <div id="personal-data">
        {!this.hasData(user) && (
          <Alert bsStyle="info">
            <span className="cap-information col-sm-1 col-md-1" />
            <FormattedMessage
              id="participation-personal-data-identity-verification"
              className="col-sm-7 col-md-7"
            />
          </Alert>
        )}
        {this.hasData(user) && (
          <Alert bsStyle="info" id="project-participation-collected-data">
            <span className="cap-information col-sm-1 col-md-1" />
            <FormattedMessage
              id="project-participation-collected-data"
              className="col-sm-11 col-md-11"
            />
          </Alert>
        )}
        <Panel id="personal-data-form">
          <h2>
            <FormattedMessage id="personal-data" />
          </h2>
          {!this.hasData(user) && (
            <div className="personal_data_field">
              <Well>
                <FormattedMessage id="no-data" />
              </Well>
            </div>
          )}
          {this.hasData(user) && (
            <div>
              <Form horizontal onSubmit={handleSubmit}>
                {user.firstname && (
                  <FormGroup controlId="formHorizontalFirstname" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_firstname" />
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" defaultValue={user.firstname} />
                    </Col>
                  </FormGroup>
                )}
                {user.lastname && (
                  <FormGroup controlId="formHorizontalLastname" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_lastname" />
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" defaultValue={user.lastname} />
                    </Col>
                  </FormGroup>
                )}
                {user.gender && (
                  <FormGroup controlId="formHorizontalGender" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_gender" />
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl componentClass="select" placeholder="select">
                        <option selected={user.gender === 'm' ? 'selected' : ''} value="m">
                          <FormattedMessage id="gender.male" />
                        </option>
                        <option selected={user.gender === 'f' ? 'selected' : ''} value="f">
                          <FormattedMessage id="gender.female" />
                        </option>
                        <option selected={user.gender === 'o' ? 'selected' : ''} value="o">
                          <FormattedMessage id="gender.other" />
                        </option>
                      </FormControl>
                    </Col>
                  </FormGroup>
                )}
                {user.dateOfBirth && (
                  <FormGroup controlId="formHorizontalDateOfBirth" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_date_of_birth" />
                      </ControlLabel>
                    </Col>
                    <Col sm={8} id="personal-data-date-of-birth">
                      <Col sm={3} md={3} id="personal-data-date-of-birth-day">
                        <DayPicker
                          defaultValue={'Jour'}
                          year={this.state.year}
                          month={this.state.month}
                          value={this.state.day}
                          onChange={day => {
                            this.setState({ day });
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
                            this.setState({ month });
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
                            this.setState({ year });
                          }}
                          id={'year'}
                          name={'year'}
                          classes={'form-control'}
                          optionClasses={'option classes'}
                        />
                      </Col>
                    </Col>
                  </FormGroup>
                )}
                {hasAddressData(user) && (
                  <FormGroup controlId="formHorizontalAdress" className="personal_data_field">
                    {user.address && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_address" />
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" defaulValue={user.address} />
                        </Col>
                      </Col>
                    )}
                    {user.address2 && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_address2" />
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" defaulValue={user.address2} />
                        </Col>
                      </Col>
                    )}
                    {user.city && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_city" />
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" value={user.city} />
                        </Col>
                      </Col>
                    )}
                    {user.zipCode && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_zip_code" />
                          </ControlLabel>
                        </Col>
                        <Col sm={4} md={4}>
                          <FormControl type="text" defaultValue={user.zipCode} />
                        </Col>
                      </Col>
                    )}
                  </FormGroup>
                )}
                {user.phone && (
                  <FormGroup controlId="formHorizontalPhone" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="global.phone" />
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" defaultValue={user.phone} />
                    </Col>
                  </FormGroup>
                )}
                <FormGroup controlId="formHorizontalPhone" className="personal_data_field">
                  <ButtonToolbar className="box-content__toolbar">
                    <Button
                      disabled={invalid || dirty || submitting}
                      type="submit"
                      bsStyle="primary"
                      id="proposal-form-admin-content-save">
                      <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
                    </Button>
                    <AlertForm
                      valid={dirty ? true : valid}
                      invalid={dirty ? false : invalid}
                      errorMessage={error}
                      submitSucceeded={submitSucceeded}
                      submitFailed={submitFailed}
                      submitting={submitting}
                    />
                  </ButtonToolbar>
                </FormGroup>
              </Form>
            </div>
          )}
        </Panel>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(PersonalData);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => ({
  initialValues: props.personalDataForm,
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment PersonalData_user on User {
      username
      firstname
      lastname
      dateOfBirth
      phone
      address
      address2
      zipCode
      city
      gender
    }
  `,
);
