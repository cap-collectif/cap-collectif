// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import renderComponent from '../../Form/Field';
import UserListField from '../Field/UserListField';
import ProjectTypeListField from '../Field/ProjectTypeListField';

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

const onSubmit = (values: any) => {
};

const validate = () => {
  const errors = {};

  return errors;
};

const formName="projectAdmin";

const ProjectContentAdminForm = (props: Props) => {
  const { handleSubmit, intl, invalid, submitting, pristine } = props;

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
        name="authors"
        clearable
        selectFieldIsObject
        debounce
        autoload={false}
        multi
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        placeholder={intl.formatMessage({ id: 'all-the-authors' })}
        label={intl.formatMessage({ id: 'admin.fields.project.authors' })}
        ariaControls="EventListFilters-filter-author-listbox"
      />

      <ProjectTypeListField />
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
      <Button
        type="submit"
        disabled={invalid || submitting || pristine}
        bsStyle="primary">
        {submitting ? (
          <FormattedMessage id="global.loading" />
        ) : (
          <FormattedMessage id="global.save" />
        )}
      </Button>
    </form>
  );
};

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName
  })(ProjectContentAdminForm),
);

export default connect()(form);