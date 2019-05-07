// @flow
import React from 'react';
import type { FormProps } from 'redux-form';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import type { State } from '../../../types';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateContactPageMutation from '../../../mutations/UpdateContactPageMutation';

type Props = {
  ...FormProps,
};

type FormValues = {
  title: string,
  description: ?string,
};

const formName = 'contact-admin-form';

const validate = (values: FormValues) => {
  const errors = {};
  if (values.title === undefined || values.title.trim() === '') {
    errors.title = 'fill-field';
  }

  return errors;
};

const onSubmit = (values: FormValues) => {
  const { title, description } = values;
  const input = {
    title,
    description,
  };
  return UpdateContactPageMutation.commit({ input });
};

export const ContactAdminForm = (props: Props) => {
  const {
    handleSubmit,
    submitting,
    valid,
    submitSucceeded,
    error,
    submitFailed,
    invalid,
    pristine,
  } = props;
  const optional = (
    <span className="excerpt">
      <FormattedMessage id="global.form.optional" />
    </span>
  );
  return (
    <form onSubmit={handleSubmit} id={formName}>
      <Field
        type="text"
        name="title"
        label={<FormattedMessage id="admin.fields.group.title" />}
        helpPrint={false}
        component={renderComponent}
      />
      <Field
        type="editor"
        name="description"
        component={renderComponent}
        label={
          <span>
            <FormattedMessage id="proposal.body" />
            {optional}
          </span>
        }
      />
      <Button
        disabled={invalid || submitting || pristine}
        type="submit"
        bsStyle="primary"
        className="mb-15">
        {submitting ? (
          <FormattedMessage id="global.loading" />
        ) : (
          <FormattedMessage id="global.save" />
        )}
      </Button>
      <AlertForm
        valid={valid}
        invalid={false}
        submitting={submitting}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
        errorMessage={error}
      />
    </form>
  );
};

const mapStateToProps = (state: State) => ({
  initialValues: {
    title: state.default.parameters['contact.title'],
    description: state.default.parameters['contact.content.body'],
  },
});

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ContactAdminForm);

export default connect(mapStateToProps)(form);
