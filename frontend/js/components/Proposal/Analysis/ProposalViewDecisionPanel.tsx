import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'

import styled from 'styled-components'
import type { ProposalViewDecisionPanel_proposal } from '~relay/ProposalViewDecisionPanel_proposal.graphql'
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel'
import { getLabelData } from './ProposalAnalysisUserRow'
import { ResponsesView } from './ProposalViewAnalysisPanel'
import WYSIWYGRender from '../../Form/WYSIWYGRender'

const DecidorView = styled.div`
  p {
    font-size: 16px;
    margin-top: 20px;
    font-weight: 600;
    margin-bottom: 0;
  }

  p + span {
    display: block;
    margin-bottom: 20px;
    :first-letter {
      text-transform: uppercase;
    }
  }
`
type Props = {
  proposal: ProposalViewDecisionPanel_proposal
}
export const ProposalViewDecisionPanel = ({ proposal }: Props) => {
  if (!proposal?.decision) return null
  const { decision } = proposal
  const status =
    decision.state === 'IN_PROGRESS'
      ? 'IN_PROGRESS'
      : decision.isApproved === false
      ? 'UNFAVOURABLE'
      : decision.isApproved
      ? 'FAVOURABLE'
      : undefined
  const labelData = getLabelData(status)
  const authors = decision?.officialResponse?.authors || []
  return (
    <>
      <ResponsesView>
        <DecidorView>
          <ProposalAnalysisStatusLabel
            fontSize={14}
            iconSize={10}
            color={labelData.color}
            iconName={labelData.icon}
            text={labelData.text}
          />
          {decision.estimatedCost !== null ? (
            <>
              <FormattedMessage tagName="p" id="global.estimation" />
              {decision.estimatedCost} €
            </>
          ) : null}
          {decision.officialResponse?.body ? (
            <>
              <FormattedMessage tagName="p" id="official.answer" />
              {authors.length ? (
                <FormattedMessage
                  id={authors.length < 2 ? 'global.byAuthor' : 'project-authors'}
                  values={{
                    author: authors[0].username,
                    authorName: authors[0].username,
                    number: authors.length - 1,
                  }}
                />
              ) : null}
            </>
          ) : null}
        </DecidorView>
        <WYSIWYGRender value={decision?.officialResponse?.body} />
      </ResponsesView>
    </>
  )
}
export default createFragmentContainer(ProposalViewDecisionPanel, {
  proposal: graphql`
    fragment ProposalViewDecisionPanel_proposal on Proposal {
      id
      decision {
        state
        estimatedCost
        officialResponse {
          id
          body
          authors {
            id
            username
          }
        }
        isApproved
      }
    }
  `,
})
