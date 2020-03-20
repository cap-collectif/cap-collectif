// @flow
import * as React from 'react';
import memoize from 'lodash/memoize';
import { type IntlShape } from 'react-intl';
import { FieldArray } from 'redux-form';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import renderResponses from '~/components/Form/RenderResponses';

const memoizeAvailableQuestions: any = memoize(() => {});

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
    const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
      'availableQuestions',
    );

    return (
      <FieldArray
        name="responses"
        change={change}
        responses={responses}
        form={form}
        component={renderResponses}
        questions={questions}
        intl={intl}
        availableQuestions={availableQuestions}
        memoize={memoizeAvailableQuestions}
      />
    );
  }
}

export default ModalRegistrationFormQuestions;
