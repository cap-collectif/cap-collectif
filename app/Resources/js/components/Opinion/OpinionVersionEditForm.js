// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import renderInput from '../Form/Field';
import { editOpinionVersion as onSubmit } from '../../redux/modules/opinion';
import type { State } from '../../types';

export const formName = 'opinion-version-edit';

const validate = ({ confirm, title, comment }) => {
  const errors = {};
  if (!confirm) {
    errors.confirm = 'global.required';
  }
  if (title) {
    if (title.length <= 2) {
      errors.title = 'opinion.version.title_error';
    }
  } else {
    errors.title = 'global.required';
  }
  if (comment) {
    if ($(comment).text().length < 2) {
      errors.comment = 'opinion.version.comment_error';
    }
  } else {
    errors.comment = 'global.required';
  }
  return errors;
};

const OpinionVersionEditForm = React.createClass({
  propTypes: {
    versionId: PropTypes.string.isRequired,
  },

  render() {
    return (
      <form>
        <div className="alert alert-warning edit-confirm-alert">
          <Field
            name="confirm"
            type="checkbox"
            component={renderInput}
            label={<FormattedMessage id="opinion.version.confirm" />}
          />
        </div>
        <Field
          name="title"
          type="text"
          component={renderInput}
          label={<FormattedMessage id="opinion.version.title" />}
        />
        <Field
          name="body"
          type="editor"
          component={renderInput}
          label={<FormattedMessage id="opinion.version.body" />}
          help={<FormattedMessage id="opinion.version.body_helper" />}
        />
        <Field
          name="comment"
          type="editor"
          component={renderInput}
          label={<FormattedMessage id="opinion.version.comment" />}
          help={<FormattedMessage id="opinion.version.comment_helper" />}
        />
      </form>
    );
  },
});

export default connect((state: State) => ({
  initialValues: {
    title:
      state.opinion.currentVersionId &&
      state.opinion.versionsById[state.opinion.currentVersionId].title,
    body:
      state.opinion.currentVersionId &&
      state.opinion.versionsById[state.opinion.currentVersionId].body,
    comment:
      state.opinion.currentVersionId &&
      state.opinion.versionsById[state.opinion.currentVersionId].comment,
  },
  opinionId:
    state.opinion.currentVersionId &&
    state.opinion.versionsById[state.opinion.currentVersionId].parent.id,
  versionId: state.opinion.currentVersionId,
}))(
  reduxForm({
    form: formName,
    onSubmit,
    validate,
  })(OpinionVersionEditForm),
);
