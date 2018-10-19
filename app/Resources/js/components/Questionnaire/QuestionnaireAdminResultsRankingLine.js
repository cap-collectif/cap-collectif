// @flow
import * as React from 'react';

type Props = {
  choice: {|
    +title: string,
    +ranking: ?$ReadOnlyArray<?{|
      +position: number,
      +responses: {|
        +totalCount: number,
      |},
    |}>,
  |},
  choicesNumber: number,
};

export class QuestionnaireAdminResultsRankingLine extends React.Component<Props> {
  render() {
    const { choice, choicesNumber } = this.props;

    const positions =
      choice.ranking &&
      choice.ranking.reduce((acc, curr) => {
        acc.push(curr && curr.position);
        return acc;
      }, []);

    const data = [];

    for (let i = 1, b = 0; i <= choicesNumber; i++) {
      if (positions && positions.includes(i)) {
        data.push({
          totalCount: choice.ranking && choice.ranking[b] && choice.ranking[b].responses.totalCount,
        });
        b++;
      } else {
        data.push({
          totalCount: 0,
        });
      }
    }

    return (
      <tr>
        <td>{choice.title}</td>
        {choice.ranking && data.map((el, key) => <td key={key}>{el.totalCount}</td>)}
      </tr>
    );
  }
}

export default QuestionnaireAdminResultsRankingLine;
