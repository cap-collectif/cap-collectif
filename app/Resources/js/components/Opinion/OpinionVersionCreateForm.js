// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import renderInput from '../Form/Field';
import { createOpinionVersion as onSubmit } from '../../redux/modules/opinion';
import type { State } from '../../types';

export const formName = 'opinion-version-create';
const validate = ({ body, title, comment }: Object, props: Object) => {
  const errors = {};
  if (body === props.initialValues.body) {
    errors.body = 'opinion.version.body_error';
  }
  if (title.length < 2) {
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

type Props = { opinionId: string };

class OpinionVersionCreateForm extends React.Component<Props> {
  render() {
    return (
      <form>
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
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  initialValues: {
    title: '',
    body:
      state.opinion.currentOpinionId &&
      state.opinion.opinionsById[state.opinion.currentOpinionId].body,
    comment: '',
  },
  opinionId: state.opinion.currentOpinionId,
});

export default connect(mapStateToProps)(
  reduxForm({
    form: formName,
    onSubmit,
    validate,
  })(OpinionVersionCreateForm),
);
