// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { QuestionnaireAdminResultsBarChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminResultsBarChart_multipleChoiceQuestion.graphql';
import { cleanMultipleChoiceQuestion } from '../../utils/cleanMultipleChoiceQuestion';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsBarChart_multipleChoiceQuestion,
  backgroundColor: string,
  intl: IntlShape,
};

export class QuestionnaireAdminResultsBarChart extends React.Component<Props> {
  render() {
    const { multipleChoiceQuestion, backgroundColor, intl } = this.props;

    const data = cleanMultipleChoiceQuestion(multipleChoiceQuestion, intl);

    return (
      <ResponsiveContainer height={340}>
        <BarChart data={data} layout="vertical" margin={{ top: 15, right: 5, bottom: 15, left: 5 }}>
          <XAxis type="number" allowDecimals={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tickLine={false} width={120} />{' '}
          <Bar dataKey="value" maxBarSize={30} fill={backgroundColor}>
            {' '}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

const container = injectIntl(QuestionnaireAdminResultsBarChart);

export default createFragmentContainer(container, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminResultsBarChart_multipleChoiceQuestion on MultipleChoiceQuestion {
      choices(allowRandomize: false) {
        title
        responses {
          totalCount
        }
      }
      isOtherAllowed
      otherResponses {
        totalCount
      }
    }
  `,
});
