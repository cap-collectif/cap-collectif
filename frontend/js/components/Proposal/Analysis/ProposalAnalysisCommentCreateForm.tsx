import * as React from 'react'
import { Box, Flex, Button as DSButton } from '@cap-collectif/ui'
import styled from 'styled-components'
import { useFragment, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CreateProposalAnalysisCommentMutation from '~/mutations/CreateProposalAnalysisCommentMutation'
import UserAvatar from '~/components/User/UserAvatar'
import { formatConnectionPath } from '~/shared/utils/relay'
import type { ProposalAnalysisCommentCreateForm_viewer$key } from '~relay/ProposalAnalysisCommentCreateForm_viewer.graphql'
import type { ProposalAnalysisCommentCreateForm_proposalAnalysis$key } from '~relay/ProposalAnalysisCommentCreateForm_proposalAnalysis.graphql'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { GlobalState } from '~/types'

type Props = {
  proposalAnalysis: ProposalAnalysisCommentCreateForm_proposalAnalysis$key
  viewer: ProposalAnalysisCommentCreateForm_viewer$key
}
const VIEWER_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentCreateForm_viewer on User {
    ...UserAvatar_user
  }
`
const PROPOSAL_ANALYSIS_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentCreateForm_proposalAnalysis on ProposalAnalysis {
    id
  }
`
const TextArea = styled.textarea`
  padding: 8px;
`
const Button = styled(DSButton)`
  background-color: ${props => props.buttonBackgroundColor} !important;
  color: ${props => props.buttonTextColor} !important;
  &:disabled {
    opacity: 0.5;
  }
`

const ProposalAnalysisCommentCreateForm = ({ proposalAnalysis: proposalAnalysisRef, viewer: viewerRef }: Props) => {
  const proposalAnalysis = useFragment(PROPOSAL_ANALYSIS_FRAGMENT, proposalAnalysisRef)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const [buttonBackgroundColor, buttonTextColor] = useSelector((state: GlobalState) => {
    return [state.default.parameters['color.btn.primary.bg'], state.default.parameters['color.btn.primary.text']]
  })
  const intl = useIntl()
  const [body, setBody] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const hasTyped = body.trim().length > 0
  const connectionId = formatConnectionPath(['client', proposalAnalysis.id], 'ProposalAnalysis_comments')

  const onSubmit = async event => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await CreateProposalAnalysisCommentMutation.commit({
        input: {
          proposalAnalysisId: proposalAnalysis.id,
          body,
        },
        connections: [connectionId],
      })
    } catch (error) {
      mutationErrorToast(intl)
      setIsLoading(false)
    }

    setIsLoading(false)
    setBody('')
  }

  return (
    <Box mb={4}>
      <Flex>
        <UserAvatar user={viewer} displayUrl={false} />
        <Flex id="create-analysis-comment-form" as="form" direction="column" width="100%" action="">
          <TextArea
            name=""
            id=""
            // @ts-ignore expect number
            rows="5"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={intl.formatMessage({
              id: 'write-a-comment',
            })}
            required
          />
          {hasTyped && (
            <Box width="100%" mt={2}>
              <Button
                type="submit"
                variant="primary"
                variantSize="small"
                isLoading={isLoading}
                disabled={!hasTyped}
                onClick={onSubmit}
                buttonBackgroundColor={buttonBackgroundColor}
                buttonTextColor={buttonTextColor}
              >
                {intl.formatMessage({
                  id: 'comment.submit',
                })}
              </Button>
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export default ProposalAnalysisCommentCreateForm
