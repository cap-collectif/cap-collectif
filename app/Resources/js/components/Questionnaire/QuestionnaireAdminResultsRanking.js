// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Table from '../Ui/Table/Table';
import type { QuestionnaireAdminResultsRanking_multipleChoiceQuestion } from '~relay/QuestionnaireAdminResultsRanking_multipleChoiceQuestion.graphql';
import QuestionnaireAdminResultsRankingLine from './QuestionnaireAdminResultsRankingLine';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsRanking_multipleChoiceQuestion,
};

export class QuestionnaireAdminResultsRanking extends React.Component<Props> {
  getHead = (choicesNumber: number) => {
    const tableHead = [];

    tableHead.push(
      <th key={0}>
        <FormattedMessage id='global.ranking' />
      </th>,
    );

    for (let i = 1; i <= choicesNumber; i++) {
      tableHead.push(
        <th key={i}>
          <FormattedMessage id="ordinal-number" values={{ num: i }} />
        </th>,
      );
    }

    return tableHead;
  };

  render() {
    const { multipleChoiceQuestion } = this.props;

    const choicesNumber = multipleChoiceQuestion.choices
      ? multipleChoiceQuestion.choices.length
      : 0;

    return (
      <Table hover>
        <thead>
          <tr>{this.getHead(choicesNumber)}</tr>
        </thead>
        <tbody>
          {multipleChoiceQuestion.choices &&
            multipleChoiceQuestion.choices.map((choice, key) => (
              <QuestionnaireAdminResultsRankingLine
                key={key}
                choice={choice}
                choicesNumber={choicesNumber}
              />
            ))}
        </tbody>
      </Table>
    );
  }
}

export default createFragmentContainer(QuestionnaireAdminResultsRanking, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminResultsRanking_multipleChoiceQuestion on MultipleChoiceQuestion {
      choices(allowRandomize: false) {
        title
        ranking {
          position
          responses {
            totalCount
          }
        }
      }
    }
  `,
});
