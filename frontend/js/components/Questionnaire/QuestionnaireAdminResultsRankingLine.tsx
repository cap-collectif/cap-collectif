import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import type { QuestionnaireAdminResultsRankingLine_choice } from '~relay/QuestionnaireAdminResultsRankingLine_choice.graphql'

type Props = {
  choice: QuestionnaireAdminResultsRankingLine_choice
  choicesNumber: number
}
export const QuestionnaireAdminResultsRankingLine = ({ choice, choicesNumber }: Props) => {
  const positions =
    choice.ranking &&
    choice.ranking.reduce((acc, curr) => {
      acc.push(curr && curr.position)
      return acc
    }, [])
  const data = []

  for (let i = 1, b = 0; i <= choicesNumber; i++) {
    if (positions && positions.includes(i)) {
      data.push({
        totalCount: choice.ranking && choice.ranking[b] && choice.ranking[b].responses.totalCount,
      })
      b++
    } else {
      data.push({
        totalCount: 0,
      })
    }
  }

  return (
    <tr>
      <td>{choice.title}</td>
      {choice.ranking && data.map((el, key) => <td key={key}>{el.totalCount}</td>)}
    </tr>
  )
}
export default createFragmentContainer(QuestionnaireAdminResultsRankingLine, {
  choice: graphql`
    fragment QuestionnaireAdminResultsRankingLine_choice on QuestionChoice {
      title
      ranking {
        position
        responses {
          totalCount
        }
      }
    }
  `,
})
