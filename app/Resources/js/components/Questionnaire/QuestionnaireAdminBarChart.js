// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import {
  Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis
} from 'recharts';
import type { QuestionnaireAdminBarChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminBarChart_multipleChoiceQuestion.graphql';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminBarChart_multipleChoiceQuestion,
}

export class QuestionnaireAdminBarChart extends React.Component<Props> {
  render() {
    const { multipleChoiceQuestion } = this.props;

    const data = multipleChoiceQuestion.questionChoices.reduce((acc, curr) => {
      acc.push({
        name: curr.title,
        value: curr.responses.totalCount
      });
      return acc;
    }, []);

    return (
      <ResponsiveContainer height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" allowDecimals={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tickLine={false} width={100}/> {/* allowDataOverflow */}
          <Bar dataKey='value' maxBarSize={30} > {/* fill='#8884d8' */}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default createFragmentContainer( QuestionnaireAdminBarChart, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminBarChart_multipleChoiceQuestion on MultipleChoiceQuestion {
      questionChoices {
        title
        responses {
          totalCount
        }
      }
    }
  `,
});
