// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import Fetcher, { json } from '../../../services/Fetcher';
import type { State, Dispatch } from '../../../types';
import renderInput from '../../Form/Field';
import { closeOpinionEditModal } from '../../../redux/modules/opinion';

export const formName = 'opinion-edit-form';
const validate = ({ title, body, check }: Object) => {
  const errors = {};
  if (!title || title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!body || $(body).text().length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  if (!check) {
    errors.check = 'global.constraints.check';
  }
  return errors;
};

const onSubmit = (data: Object, dispatch: Dispatch, props: Object) => {
  const { opinion } = props;
  // We format appendices to call API (could be improved by changing api design)
  const appendices = Object.keys(data)
    .filter(key => key !== 'title' && key !== 'body' && key !== 'check')
    .map(key => {
      return {
        appendixType: opinion.appendices.filter(a => a.type.title === key)[0].type.id,
        body: data[key],
      };
    });
  const form = {
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.put(`/opinions/${opinion.id}`, form)
    .then(json)
    .then(opinionUpdated => {
      dispatch(closeOpinionEditModal());
      window.location.href = opinionUpdated._links.show;
    });
};

type Props = {
  opinion: Object,
  step: Object,
  handleSubmit: Function,
  initialValues: Object,
};

export class OpinionEditForm extends React.Component<Props> {
  render() {
    const { opinion, step, handleSubmit } = this.props;
    return (
      <form id={formName} onSubmit={handleSubmit}>
        <Field
          name="check"
          children={<FormattedMessage id="opinion.edit_check" />}
          type="checkbox"
          component={renderInput}
          id="opinion_check"
          divClassName="alert alert-warning edit-confirm-alert"
        />
        <Field
          name="title"
          type="text"
          id="opinion_title"
          component={renderInput}
          help={step.titleHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor"
          id="opinion_body"
          component={renderInput}
          help={step.descriptionHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.body" />}
        />
        {opinion.appendices.map((field, index) => (
          <Field
            key={index}
            component={renderInput}
            name={field.type.title}
            label={field.type.title}
            type="editor"
            id={`opinion_appendix-${index + 1}`}
          />
        ))}
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => {
  const dynamicsInitialValues = {};
  for (const appendix of props.opinion.appendices) {
    dynamicsInitialValues[appendix.type.title] = appendix.body;
  }
  return {
    initialValues: {
      title: props.opinion.title,
      body: props.opinion.body,
      ...dynamicsInitialValues,
    },
  };
};

export default connect(mapStateToProps)(
  reduxForm({
    form: formName,
    onSubmit,
    validate,
  })(OpinionEditForm),
);
