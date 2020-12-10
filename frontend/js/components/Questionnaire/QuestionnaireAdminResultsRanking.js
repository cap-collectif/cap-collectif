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

export const QuestionnaireAdminResultsRanking = ({ multipleChoiceQuestion }: Props) => {
  const choicesNumber = multipleChoiceQuestion.choices?.totalCount || 0;

  const getHead = () => {
    const tableHead = [];

    tableHead.push(
      <th key={0}>
        <FormattedMessage id="global.ranking" />
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

  return (
    <Table hover>
      <thead>
        <tr>{getHead()}</tr>
      </thead>
      <tbody>
        {multipleChoiceQuestion.choices &&
          multipleChoiceQuestion.choices.edges &&
          multipleChoiceQuestion.choices.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(choice => (
              <QuestionnaireAdminResultsRankingLine
                key={choice.id}
                choice={choice}
                choicesNumber={choicesNumber}
              />
            ))}
      </tbody>
    </Table>
  );
};

export default createFragmentContainer(QuestionnaireAdminResultsRanking, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminResultsRanking_multipleChoiceQuestion on MultipleChoiceQuestion {
      choices(allowRandomize: false) {
        totalCount
        edges {
          node {
            id
            ...QuestionnaireAdminResultsRankingLine_choice
          }
        }
      }
    }
  `,
});
