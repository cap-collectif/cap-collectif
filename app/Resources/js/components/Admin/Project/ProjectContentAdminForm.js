// @flow
import React from 'react';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import renderComponent from '../../Form/Field';
import UserListField from '../Field/UserListField';

type Props = {|
  ...FormProps,
  handleSubmit: () => void,
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
  const { formName, handleSubmit } = props;

  return (
    <form onSubmit={handleSubmit} id={formName}>
      <Field
        type="text"
        name="title"
        label={<FormattedMessage id="admin.fields.group.title" />}
        helpPrint={false}
        component={renderComponent}
      />
      <UserListField
        id="project-author"
        name="author"
        authorOfEvent
        clearable
        selectFieldIsObject
        debounce
        autoload={false}
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        placeholder="all-the-authors"
        label="project_download.label.author"
        ariaControls="EventListFilters-filter-author-listbox"
      />
      <Field
        name="theme"
        type="select"
        component={renderComponent}
        label={
          <span>
            <FormattedMessage id="proposal.theme" />
          </span>
        }>
        <FormattedMessage id="proposal.select.theme">
          {(message: string) => <option value="">{message}</option>}
        </FormattedMessage>
        {projectTerms.map(projectTerm => (
          <option key={projectTerm.id} value={projectTerm.id}>
            {projectTerm.label}
          </option>
        ))}
      </Field>
      <Field
        name="theme"
        type="select"
        component={renderComponent}
        label={
          <span>
            <FormattedMessage id="proposal.theme" />
          </span>
        }>
        <FormattedMessage id="proposal.select.theme">
          {(message: string) => <option value="">{message}</option>}
        </FormattedMessage>
      </Field>
    </form>
  );
};

export default reduxForm({
  validate,
  onSubmit,
})(ProjectContentAdminForm);
