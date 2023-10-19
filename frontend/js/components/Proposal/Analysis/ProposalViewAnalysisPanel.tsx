import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import styled from 'styled-components'
import type { ProposalViewAnalysisPanel_proposal } from '~relay/ProposalViewAnalysisPanel_proposal.graphql'
import type { ProposalViewAnalysisPanel_viewer } from '~relay/ProposalViewAnalysisPanel_viewer.graphql'
import colors from '~/utils/colors'
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel'
import { getLabelData } from './ProposalAnalysisUserRow'
import ProposalResponse from '~/components/Proposal/Page/ProposalResponse'
import ProposalAnalysisComments from '~/components/Proposal/Analysis/ProposalAnalysisComments'

type Props = {
  proposal: ProposalViewAnalysisPanel_proposal
  userId: string
  viewer: ProposalViewAnalysisPanel_viewer
}
export const ResponsesView = styled.div<{
  tooLate?: boolean
}>`
  padding: 30px;
  margin-top: 70px;
  opacity: ${props => props.tooLate && '.5'};
`
export const CommentView = styled.div<{
  tooLate?: boolean
}>`
  width: 400px;
  background: ${colors.grayF4};
  padding: 20px;
  opacity: ${props => props.tooLate && '.5'};

  p {
    font-size: 16px;
    font-weight: 600;
  }
`
export const ProposalViewAnalysisPanel = ({ proposal, userId, viewer }: Props) => {
  const analysis = proposal.analyses?.find(a => a.analyst.id === userId)
  if (!analysis) return null
  const { state } = analysis
  const questions = proposal?.form?.analysisConfiguration?.evaluationForm?.questions.map(q => q.id) || []
  const labelData = getLabelData(analysis.state)
  return (
    <>
      <ResponsesView tooLate={state === 'TOO_LATE'}>
        <ProposalAnalysisStatusLabel
          fontSize={14}
          iconSize={10}
          color={labelData.color}
          iconName={labelData.icon}
          text={labelData.text}
        />
        {analysis.responses
          ?.filter(Boolean)
          .filter(response => response.question)
          .filter(response => {
            switch (response.__typename) {
              case 'MediaResponse':
                return response.medias && response.medias.length > 0

              case 'ValueResponse':
                return !!response.value

              default:
                return false
            }
          })
          .filter(response => questions.includes(response.question.id))
          .map((response, index) => (
            <ProposalResponse key={index} response={response} />
          ))}
      </ResponsesView>
      <ProposalAnalysisComments viewer={viewer} proposalAnalysis={analysis} />
    </>
  )
}
export default createFragmentContainer(ProposalViewAnalysisPanel, {
  viewer: graphql`
    fragment ProposalViewAnalysisPanel_viewer on User {
      ...ProposalAnalysisComments_viewer
    }
  `,
  proposal: graphql`
    fragment ProposalViewAnalysisPanel_proposal on Proposal {
      id
      analyses {
        id
        ...ProposalAnalysisComments_proposalAnalysis
        analyst {
          id
        }
        state
        responses {
          __typename
          ...responsesHelper_response @relay(mask: false)
          ...ProposalResponse_response
        }
      }
      form {
        analysisConfiguration {
          id
          evaluationForm {
            questions {
              id
            }
          }
        }
      }
    }
  `,
})
