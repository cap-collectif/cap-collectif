// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import Fetcher, { json } from '../../../services/Fetcher';
import type { Dispatch, State } from '../../../types';
import renderInput from '../../Form/Field';
import { closeOpinionEditModal } from '../../../redux/modules/opinion';
import type { OpinionEditForm_opinion } from '~relay/OpinionEditForm_opinion.graphql';

type RelayProps = {|
  opinion: OpinionEditForm_opinion,
|};

export const formName = 'opinion-edit-form';
const validate = ({ title, body, check }: Object) => {
  const errors = {};
  if (!title || title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }

  if (!body || body.length < 2) {
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
    .map(key => ({
      appendixType: opinion.appendices.filter(a => a.appendixType.title === key)[0].appendixType.id,
      body: data[key],
    }));
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

type Props = {|
  ...RelayProps,
  handleSubmit: Function,
  initialValues: Object,
|};

export class OpinionEditForm extends React.Component<Props> {
  render() {
    const { opinion, handleSubmit } = this.props;
    const { step } = opinion;
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
          help={
            step.consultations &&
            step.consultations.edges &&
            step.consultations.edges[0] &&
            step.consultations.edges[0].node &&
            step.consultations.edges[0].node.titleHelpText
          }
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor"
          id="opinion_body"
          component={renderInput}
          help={
            step.consultations &&
            step.consultations.edges &&
            step.consultations.edges[0] &&
            step.consultations.edges[0].node &&
            step.consultations.edges[0].node.descriptionHelpText
          }
          autoFocus
          label={<FormattedMessage id="opinion.body" />}
        />
        {opinion.appendices &&
          opinion.appendices
            .filter(Boolean)
            .map((field, index) => (
              <Field
                key={index}
                component={renderInput}
                name={field.appendixType.title}
                label={field.appendixType.title}
                type="editor"
                id={`opinion_appendix-${index + 1}`}
              />
            ))}
      </form>
    );
  }
}

const mapStateToProps = (state: State, props: RelayProps) => {
  const dynamicsInitialValues = {};
  if (props.opinion.appendices) {
    for (const appendix of props.opinion.appendices) {
      if (appendix && appendix.appendixType) {
        dynamicsInitialValues[appendix.appendixType.title] = appendix.body;
      }
    }
  }
  return {
    initialValues: {
      title: props.opinion.title,
      body: props.opinion.body,
      ...dynamicsInitialValues,
    },
  };
};

const container = connect(mapStateToProps)(
  reduxForm({
    form: formName,
    onSubmit,
    validate,
  })(OpinionEditForm),
);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionEditForm_opinion on Opinion {
      appendices {
        appendixType {
          title
        }
        body
      }
      step {
        consultations(first: 1) {
          edges {
            node {
              titleHelpText
              descriptionHelpText
            }
          }
        }
      }
      id
      title
      body
    }
  `,
});
