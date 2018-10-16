// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { QuestionnaireAdminResultsBarChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminResultsBarChart_multipleChoiceQuestion.graphql';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsBarChart_multipleChoiceQuestion,
  backgroundColor: string,
};

export class QuestionnaireAdminResultsBarChart extends React.Component<Props> {
  render() {
    const { multipleChoiceQuestion, backgroundColor } = this.props;

    const data =
      multipleChoiceQuestion.questionChoices &&
      multipleChoiceQuestion.questionChoices.reduce((acc, curr) => {
        acc.push({
          name: curr.title,
          value: curr.responses.totalCount,
        });
        return acc;
      }, []);

    return (
      <ResponsiveContainer height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" allowDecimals={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tickLine={false} width={100} />{' '}
          {/* allowDataOverflow */}
          <Bar dataKey="value" maxBarSize={30} fill={backgroundColor}>
            {' '}
            {/* fill='#8884d8' */}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default createFragmentContainer(QuestionnaireAdminResultsBarChart, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminResultsBarChart_multipleChoiceQuestion on MultipleChoiceQuestion {
      questionChoices {
        title
        responses {
          totalCount
        }
      }
    }
  `,
});
