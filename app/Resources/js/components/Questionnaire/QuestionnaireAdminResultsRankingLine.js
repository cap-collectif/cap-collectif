// @flow
import * as React from 'react';

type Props = {
  choice: Object,
  choicesNumber: number,
};

export class QuestionnaireAdminResultsRankingLine extends React.Component<Props> {
  getEmptyCell = () => {
    const { choicesNumber } = this.props;

    const arr = [];
    let i = 0;

    while (i < choicesNumber) {
      arr.push(<td key={`e${i}`}>0</td>);
      i++;
    }

    return arr;
  };

  render() {
    const { choice, choicesNumber } = this.props;

    const positions = choice.ranking.reduce((acc, curr) => {
      acc.push(curr.position);
      return acc;
    }, []);

    const data = [];

    for (let i = 1, b = 0; i <= choicesNumber; i++) {
      if (positions.includes(i)) {
        data.push({
          totalCount: choice.ranking[b].responses.totalCount,
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
        {choice.ranking &&
          choice.ranking.length !== 0 &&
          data.map((el, key) => <td key={key}>{el.totalCount}</td>)}
        {choice.ranking && choice.ranking.length === 0 && this.getEmptyCell()}
      </tr>
    );
  }
}

export default QuestionnaireAdminResultsRankingLine;
