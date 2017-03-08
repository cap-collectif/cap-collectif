// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import renderInput from '../Form/Field';

export const formName = 'opinion-version-create';
const validate = (values, props) => {
  const errors = {};
  // formValidationRules: {
  //   title: {
  //     notBlank: { message: 'opinion.version.title_error' },
  //     min: { value: 2, message: 'opinion.version.title_error' },
  //   },
  //   body: undefined,
  //   confirm: undefined,
  // },
  if (values.body === props.initialValues.body) {
    errors.body = 'opinion.version.body_error';
  }
  if (!values.title) {
    errors.title = 'global.required';
  }
  return errors;
};
const OpinionVersionCreateForm = React.createClass({
  propTypes: {
    opinionId: PropTypes.string.isRequired,
    opinionBody: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      opinionBody: '',
      mode: 'create',
      user: null,
    };
  },

  // create() {
  //     this.setState({ isSubmitting: true });
  //
  //     OpinionActions
  //     .createVersion(opinionId, this.state.form)
  //     .then((version) => {
  //       this.setState(this.getInitialState());
  //       this.close();
  //       window.location.href = `${window.location.href}/versions/${version.slug}`;
  //       return true;
  //     })
  //     .catch(() => {
  //       this.setState({ isSubmitting: false, submitted: false });
  //     });
  // },


  render() {
    return (
      <form>
        <Field
          name="title"
          type="text"
          component={renderInput}
          label={this.getIntlMessage('opinion.version.title')}
          groupClassName={this.getGroupStyle('title')}
        />
        <Field
          name="body"
          type="editor"
          component={renderInput}
          label={this.getIntlMessage('opinion.version.body')}
          groupClassName={this.getGroupStyle('body')}
          help={this.getIntlMessage('opinion.version.body_helper')}
        />
        <Field
          name="comment"
          type="editor"
          component={renderInput}
          label={this.getIntlMessage('opinion.version.comment')}
          groupClassName={this.getGroupStyle('comment')}
          help={this.getIntlMessage('opinion.version.comment_helper')}
        />
      </form>
    );
  },
});

export default connect((state, props) => ({
  initialValues: {
    title: '',
    body: state.opinion.opinionsById[state.opinion.currentOpinionId].body,
    comment: null,
  },
}))(reduxForm({
  form: formName,
  validate,
})(OpinionVersionCreateForm));
