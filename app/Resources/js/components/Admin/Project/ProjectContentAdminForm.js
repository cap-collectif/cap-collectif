// @flow
import React from 'react';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import renderComponent from '../../Form/Field';
import UserListField from '../Field/UserListField';

type Props = {|
  ...FormProps,
  handleSubmit: () => void,
  intl: IntlShape,
  formName: string,
|};

const projectTerms = [
  {
    id: 0,
    label: 'project.opinion_term.opinion',
  },
  {
    id: 1,
    label: 'project.opinion_term.article',
  },
];

const onSubmit = () => {};

const validate = ({ title }: any) => {
  const errors = {};

  if (!title) {
    errors.title = 'global.required';
  } else if (title.length < 2) {
    errors.title = 'global.required';
  }
  return errors;
};

const ProjectContentAdminForm = (props: Props) => {
  const { formName, handleSubmit, intl } = props;

  return (
    <form onSubmit={handleSubmit} id={formName}>
      <Field
        type="text"
        name="title"
        label={<FormattedMessage id="admin.fields.group.title" />}
        component={renderComponent}
      />
      <UserListField
        id="project-author"
        name="author"
        clearable
        selectFieldIsObject
        debounce
        autoload={false}
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        placeholder={intl.formatMessage({ id: 'all-the-authors' })}
        label={intl.formatMessage({ id: 'admin.fields.project.authors' })}
        ariaControls="EventListFilters-filter-author-listbox"
      />

      <Field
        name="type"
        type="select"
        component={renderComponent}
        label={
          <span>
            <FormattedMessage id="admin.fields.project.type.title" />
          </span>
        }>
        <FormattedMessage id="admin.help.project.type">
          {(message: string) => <option value="">{message}</option>}
        </FormattedMessage>
      </Field>

      <Field
        name="usage"
        type="select"
        component={renderComponent}
        label={
          <span>
            <FormattedMessage id="admin.fields.project.opinion_term" />
          </span>
        }>
        {projectTerms.map(projectTerm => (
          <option key={projectTerm.id} value={projectTerm.id}>
            {intl.formatMessage({ id: projectTerm.label })}
          </option>
        ))}
      </Field>
    </form>
  );
};

export default injectIntl(
  reduxForm({
    validate,
    onSubmit,
  })(ProjectContentAdminForm),
);
