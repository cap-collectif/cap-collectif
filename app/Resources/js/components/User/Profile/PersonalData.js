// @flow
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import {Alert, Well, Panel, Col, Row} from 'react-bootstrap';
import {connect, type MapStateToProps} from "react-redux";
import {reduxForm, Field, SubmissionError, type FormProps} from 'redux-form';
import {FormattedMessage, FormattedDate, injectIntl, IntlShape} from 'react-intl';
import type PersonalData_user from "./__generated__/PersonalData_user.graphql";
import component from "../../Form/Field";
import AlertForm from '../../Alert/AlertForm';
import type {Dispatch, State} from "../../../types";

type RelayProps = { proposalForm: PersonalData_user };
type Props = FormProps & {
  user: PersonalData_user,
  intl: IntlShape
};

const formName = 'personalDataForm';

const validate = () => {
  const errors = {};
  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
};

export class PersonalData extends Component<Props> {

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
              <form onSubmit={handleSubmit}>
                {user.firstname && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="firstname"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_firstname"/>}
                      />
                    </Col>
                  </Row>
                )}
                {user.lastname && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="lastname"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_lastname"/>}
                      />
                    </Col>
                  </Row>
                )}
                {user.gender && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="gender"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_gender"/>}
                      />
                    </Col>
                  </Row>
                )}
                {user.firstname && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="firstname"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_firstname"/>}
                      />
                    </Col>
                  </Row>
                )}
                {user.firstname && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="firstname"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_firstname"/>}
                      />
                    </Col>
                  </Row>
                )}
                {user.firstname && (
                  <Row>
                    <Col sm={12} md={12} xs={12}>
                      <Field
                        type="text"
                        name="firstname"
                        divClassName="personal_data_field"
                        component={component}
                        label={<FormattedMessage id="form.label_firstname"/>}
                      />
                    </Col>
                  </Row>
                )}

              </form>
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