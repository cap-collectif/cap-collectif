// @flow
import * as React from 'react';

type Cell = {
  position: number,
  responses: {
    totalCount: number,
  },
};

type Props = {
  choice: Object,
  choicesNumber: number,
};

export class QuestionnaireAdminResultsRankingLine extends React.Component<Props> {
  getCell = (cell: Cell, key: number) => {
    const { choice, choicesNumber } = this.props;
    const rankingNb = choice.ranking ? choice.ranking.length : 0;

    if (cell && cell.position === key + 1) {
      if (rankingNb < choicesNumber && cell.position === rankingNb) {
        const arr = [];
        let position = cell.position;

        arr.push(<td key={key}>{cell.responses.totalCount}</td>);

        while (position < choicesNumber) {
          arr.push(<td key={`${key}.${position}`}>0</td>);
          position++;
        }

        return arr;
      }

      return <td key={key}>{cell.responses.totalCount}</td>;
    }

    if (cell && cell.position !== key + 1) {
      if (rankingNb < choicesNumber && key + 1 === rankingNb) {
        const arr = [];
        let i = key + 1;
        while (i <= choicesNumber) {
          if (cell && cell.position === i) {
            arr.push(<td key={`${key}.${i}`}>{cell.responses.totalCount}</td>);
          } else {
            arr.push(<td key={`${key}.${i}`}>0</td>);
          }
          i++;
        }

        return arr;
      }

      return <td key={key}>0</td>;
    }
  };

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
    const { choice } = this.props;

    return (
      <tr>
        <td>{choice.title}</td>
        {choice.ranking &&
          choice.ranking.length !== 0 &&
          choice.ranking.map((cell, key) => this.getCell(cell, key))}
        {choice.ranking && choice.ranking.length === 0 && this.getEmptyCell()}
      </tr>
    );
  }
}

export default QuestionnaireAdminResultsRankingLine;
