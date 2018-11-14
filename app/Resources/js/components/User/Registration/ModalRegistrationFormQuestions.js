// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import {FieldArray} from "redux-form";
import {formatInitialResponsesValues, renderResponses} from "../../../utils/responsesHelper";

type Props = {
  change: Function,
  responses: Array<Object>,
  form: string,
  questions: Array<Object>,
  intl: IntlShape
}

class ModalRegistrationFormQuestions extends React.Component<Props> {

  componentDidMount(): void {
    const { change, questions } = this.props
    change('responses', formatInitialResponsesValues(
      questions,
      []
    ))
  }

  render(): React.Node {
    const {
      change,
      responses,
      form,
      questions,
      intl
    } = this.props

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
    )
  }

}

export default ModalRegistrationFormQuestions
