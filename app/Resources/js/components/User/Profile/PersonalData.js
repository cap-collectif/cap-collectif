// @flow
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
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
  Button
} from 'react-bootstrap';
import {connect, type MapStateToProps} from "react-redux";
import {YearPicker, MonthPicker, DayPicker} from 'react-dropdown-date';
import {reduxForm, type FormProps} from 'redux-form';
import {FormattedMessage} from 'react-intl';
import type PersonalData_user from "./__generated__/PersonalData_user.graphql";
import AlertForm from '../../Alert/AlertForm';
import type {Dispatch, State} from "../../../types";

type RelayProps = { proposalForm: PersonalData_user };
type Props = FormProps & {
  user: PersonalData_user,
  proposalForm: PersonalData_user
};

const formName = 'personalDataForm';

const validate = () => {
  const errors = {};
  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
};

type PersonalDataState = {
  year: ?Number,
  month: ?Number,
  day: ?Number
};

export class PersonalData extends Component<Props, PersonalDataState> {
  constructor(props: Props) {
    super(props);
    if (props.user && props.user.dateOfBirth) {
      this.state = {
        year: this.getYear(props.user.dateOfBirth),
        month: this.getMonth(props.user.dateOfBirth),
        day: this.getDay(props.user.dateOfBirth)
      };
    }
  }

  getDay(date: String): any {
    let day = date.substr(8, 2);
    day = day[0] === 0 ? day[1] : day;

    return parseInt(day, 10);
  }

  getMonth(date: String): any {
    let month = date.substr(5, 2)
    month = month[0] === 0 ? month[1] : month;
    month = parseInt(month, 10);

    return month - 1;
  }

  getYear(date: String): any {
    const year = date.substr(0, 4);

    return parseInt(year, 10);
  }

  hasData(user: PersonalData_user) {
    if (
      !user.firstname &&
      !user.lastname &&
      !user.dateOfBirth &&
      !user.phone &&
      !user.address &&
      !user.address2 &&
      !user.zipCode &&
      !user.city &&
      user.gender !== 'u'
    ) {
      return false;
    }

    return true;
  }

  hasAddressData(user: PersonalData_user) {
    if (
      !user.address &&
      !user.address2 &&
      !user.zipCode &&
      !user.city
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
      pristine,
      handleSubmit,
      submitting,
      error
    } = this.props;

    return (
      <div id="personal-data">
        {!this.hasData(user) && (
          <Alert bsStyle="info">
            <span className="cap-information col-sm-1 col-md-1"></span>
            <FormattedMessage id="participation-personal-data-identity-verification" className="col-sm-7 col-md-7"/>
          </Alert>
        )}
        {this.hasData(user) && (
          <Alert bsStyle="info" id="project-participation-collected-data">
            <span className="cap-information col-sm-1 col-md-1"></span>
            <FormattedMessage id="project-participation-collected-data" className="col-sm-11 col-md-11"/>
          </Alert>
        )}
        <Panel id="personal-data-form">
          <h2><FormattedMessage id='personal-data'/></h2>
          {!this.hasData(user) && (
            <div className="personal_data_field">
              <Well><FormattedMessage id="no-data"/></Well>
            </div>
          )}
          {this.hasData(user) && (
            <div>
              <Form horizontal onSubmit={handleSubmit}>
                {user.firstname && (
                  <FormGroup controlId="formHorizontalFirstname" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_firstname"/>
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" value={user.firstname}/>
                    </Col>
                  </FormGroup>
                )}
                {user.lastname && (
                  <FormGroup controlId="formHorizontalLastname" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_lastname"/>
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" value={user.lastname}/>
                    </Col>
                  </FormGroup>
                )}
                {user.gender && (
                  <FormGroup controlId="formHorizontalGender" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_gender"/>
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" value={user.gender}/>
                    </Col>
                  </FormGroup>
                )}
                {user.dateOfBirth && (
                  <FormGroup controlId="formHorizontalDateOfBirth" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="form.label_date_of_birth"/>
                      </ControlLabel>
                    </Col>
                    <Col sm={8} id="personal-data-date-of-birth">
                      <Col sm={3} md={3} id="personal-data-date-of-birth-day">
                        <DayPicker
                          defaultValue={'Jour'}
                          year={this.state.year}
                          month={this.state.month}
                          value={this.state.day}
                          onChange={(day) => {
                            this.setState({day});
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
                          onChange={(month) => {
                            this.setState({month});
                          }}
                          geocode={'FR'}
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
                          onChange={(year) => {
                            this.setState({year});
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
                {this.hasAddressData(user) && (
                  <FormGroup controlId="formHorizontalAdress" className="personal_data_field">
                    {user.address && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_address"/>
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" value={user.address}/>
                        </Col>
                      </Col>
                    )}
                    {user.address2 && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_address2"/>
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" value={user.address2}/>
                        </Col>
                      </Col>
                    )}
                    {user.city && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_city"/>
                          </ControlLabel>
                        </Col>
                        <Col sm={8}>
                          <FormControl type="text" value={user.city}/>
                        </Col>
                      </Col>
                    )}
                    {user.zipCode && (
                      <Col sm={12}>
                        <Col sm={2}>
                          <ControlLabel componentClass={ControlLabel}>
                            <FormattedMessage id="form.label_zip_code"/>
                          </ControlLabel>
                        </Col>
                        <Col sm={4} md={4}>
                          <FormControl type="text" value={user.zipCode}/>
                        </Col>

                      </Col>
                    )}
                  </FormGroup>
                )}
                {user.phone && (
                  <FormGroup controlId="formHorizontalPhone" className="personal_data_field">
                    <Col sm={2}>
                      <ControlLabel componentClass={ControlLabel}>
                        <FormattedMessage id="global.phone"/>
                      </ControlLabel>
                    </Col>
                    <Col sm={8}>
                      <FormControl type="text" value={user.phone}/>
                    </Col>
                  </FormGroup>
                )}
                <FormGroup controlId="formHorizontalPhone" className="personal_data_field">
                  <ButtonToolbar className="box-content__toolbar">
                    <Button
                      disabled={invalid || pristine || submitting}
                      type="submit"
                      bsStyle="primary"
                      id="proposal-form-admin-content-save">
                      <FormattedMessage id={submitting ? 'global.loading' : 'global.save'}/>
                    </Button>
                    <AlertForm
                      valid={valid}
                      invalid={invalid}
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
  };
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(PersonalData);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm,
});

const container = connect(mapStateToProps)(form);

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