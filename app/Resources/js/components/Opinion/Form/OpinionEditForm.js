// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';
import type { Dispatch } from '../../../types';

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
        appendixType: opinion.appendices.filter(a => a.type.title === key)[0]
          .type.id,
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
      window.location.href = opinionUpdated._links.show;
    });
};

export const OpinionEditForm = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { opinion, step } = this.props;
    const dynamicsInitialValues = {};
    for (const appendix of opinion.appendices) {
      dynamicsInitialValues[appendix.type.title] = appendix.body;
    }
    return (
      <OpinionForm
        form={formName}
        validate={validate}
        onSubmit={onSubmit}
        fields={[
          {
            name: 'check',
            label: 'check',
            type: 'checkbox',
            id: 'opinion_check',
            divClassName: 'alert alert-warning edit-confirm-alert',
          },
          {
            name: 'title',
            label: 'title',
            type: 'text',
            id: 'opinion_title',
            help: step.titleHelpText,
          },
          {
            name: 'body',
            label: 'body',
            type: 'editor',
            id: 'opinion_body',
            help: step.descriptionHelpText,
          },
        ].concat(
          opinion.appendices.map((a, i) => {
            return {
              label: a.type.title,
              name: a.type.title,
              type: 'editor',
              id: `opinion_appendix-${i + 1}`,
            };
          }),
        )}
        initialValues={{
          title: opinion.title,
          body: opinion.body,
          ...dynamicsInitialValues,
        }}
      />
    );
  },
});

export default OpinionEditForm;
