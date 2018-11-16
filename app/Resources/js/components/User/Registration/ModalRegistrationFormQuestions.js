// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import { FieldArray } from 'redux-form';
import { formatInitialResponsesValues, renderResponses } from '../../../utils/responsesHelper';

type Props = {
  change: (field: string, value: any) => void,
  responses: Array<Object>,
  form: string,
  questions: Array<Object>,
  intl: IntlShape,
};

class ModalRegistrationFormQuestions extends React.Component<Props> {
  componentDidMount() {
    const { change, questions } = this.props;
    // TODO: Pour le moment, je passe par redux form pour injecter les questions depuis la réponse GraphQL.
    //  Idéalement, il faudrait que tout le système soit refait en GraphQL pour ne pas avoir cette bidouille
    change('questions', questions);
    change('responses', formatInitialResponsesValues(questions, []));
  }

  render() {
    const { change, responses, form, questions, intl } = this.props;

    return (
      <FieldArray
        name="responses"
        change={change}
        responses={responses}
        form={form}
        component={renderResponses}
        questions={questions}
        intl={intl}
      />
    );
  }
}

export default ModalRegistrationFormQuestions;
