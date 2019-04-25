// @flow
import React from 'react';
import { Field } from 'redux-form';
import type { FormProps } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import AlertForm from '../../Alert/AlertForm';
import renderComponent from '../../Form/Field';

type Props = {
  ...FormProps,
  handleSubmit: () => void,
  formName: string,
};

const ContactAdminForm = (props: Props) => {
  const { error, valid, formName, submitting, handleSubmit, submitFailed, submitSucceeded } = props;
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

export default ContactAdminForm;
