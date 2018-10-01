// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import renderInput from '../../Form/Field';
import Fetcher, { json } from '../../../services/Fetcher';
import type { State, Uuid, Dispatch } from '../../../types';

export const formName = 'opinion-link-create-form';
const onSubmit = (data: Object, dispatch: Dispatch, props: Object) => {
  const { opinion, availableTypes } = props;
  // We format appendices to call API (could be improved by changing api design)
  const appendices = Object.keys(data)
    .filter(key => key !== 'title' && key !== 'body' && key !== 'opinionType')
    .map(key => ({
      appendixType: availableTypes
        .filter(type => type.id === data.opinionType)[0]
        .appendixTypes.filter(t => t.title === key)[0].id,
      body: data[key],
    }));
  const form = {
    OpinionType: data.opinionType,
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.post(`/opinions/${opinion.id}/links`, form)
    .then(json)
    .then(link => {
      window.location.href = link._links.show;
    });
};

type Props = {
  availableTypes: Array<Object>,
  // eslint-disable-next-line react/no-unused-prop-types
  opinion: Object,
  handleSubmit: Function,
  currentType: ?Object,
  initialValues: {
    opinionType: ?Uuid,
  },
};

export class OpinionLinkCreateForm extends React.Component<Props> {
  render() {
    const { currentType, availableTypes, handleSubmit } = this.props;
    return (
      <form id={formName} onSubmit={handleSubmit}>
        <Field
          autoFocus
          label={<FormattedMessage id="opinion.link.select_type" />}
          name="opinionType"
          type="select"
          component={renderInput}
          disableValidation>
          <option disabled>{<FormattedMessage id="global.select" />}</option>
          {availableTypes.map((type, i) => (
            <option key={i} value={type.id}>
              {type.title}
            </option>
          ))}
        </Field>
        <Field
          name="title"
          type="text"
          id="opinion_title"
          component={renderInput}
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor"
          id="opinion_body"
          component={renderInput}
          autoFocus
          label={<FormattedMessage id="opinion.body" />}
        />
        {currentType &&
          currentType.appendixTypes.map((field, index) => (
            <Field
              key={index}
              component={renderInput}
              name={field.title}
              label={field.title}
              type="editor"
              id={`opinion_appendix-${index + 1}`}
            />
          ))}
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, { availableTypes }: Props) => {
  const currentTypeId = formValueSelector(formName)(state, 'opinionType');
  const initialType = availableTypes[0];
  return {
    currentType: currentTypeId
      ? availableTypes.filter(t => t.id === currentTypeId)[0]
      : initialType,
    initialValues: {
      opinionType: initialType.id,
    },
  };
};

export default connect(mapStateToProps)(
  reduxForm({
    onSubmit,
    form: formName,
  })(OpinionLinkCreateForm),
);
