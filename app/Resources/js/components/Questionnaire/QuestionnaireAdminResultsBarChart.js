// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { QuestionnaireAdminResultsBarChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminResultsBarChart_multipleChoiceQuestion.graphql';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsBarChart_multipleChoiceQuestion,
  backgroundColor: string,
  intl: IntlShape,
};

export class QuestionnaireAdminResultsBarChart extends React.Component<Props> {
  render() {
    const { multipleChoiceQuestion, backgroundColor, intl } = this.props;

    const data =
      multipleChoiceQuestion.questionChoices &&
      multipleChoiceQuestion.questionChoices
        .filter(choice => choice.responses.totalCount > 0)
        .reduce((acc, curr) => {
          acc.push({
            name: curr.title,
            value: curr.responses.totalCount,
          });
          return acc;
        }, []);

    if (
      data &&
      multipleChoiceQuestion &&
      multipleChoiceQuestion.isOtherAllowed &&
      multipleChoiceQuestion.otherResponses &&
      multipleChoiceQuestion.otherResponses.totalCount !== 0
    ) {
      data.push({
        name: intl.formatMessage({ id: 'global.question.types.other' }),
        value:
          multipleChoiceQuestion.otherResponses && multipleChoiceQuestion.otherResponses.totalCount,
      });
    }

    return (
      <ResponsiveContainer height={320}>
        <BarChart data={data} layout="vertical">
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
      questionChoices {
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
