import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import ProposalPageComments from '../ProposalPageComments'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import type { ProposalPageDiscussions_proposal } from '~relay/ProposalPageDiscussions_proposal.graphql'
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style'

type Props = {
  proposal: ProposalPageDiscussions_proposal | null | undefined
}
export const ProposalPageDiscussions = ({ proposal }: Props) => {
  if (proposal?.publicationStatus === 'DRAFT' || !proposal?.form.commentable) return null
  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={9} paddingTop={8}>
            <Icon name={ICON_NAME.conversation} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h2>
            <FormattedMessage id="proposal.tabs.comments" />
          </h2>
        </CategoryTitle>
        {proposal?.publicationStatus !== 'DRAFT' && (
          <ProposalPageComments proposal={proposal} unstable__enableCapcoUiDs />
        )}
      </CategoryContainer>
    </Card>
  )
}
export default createFragmentContainer(ProposalPageDiscussions, {
  proposal: graphql`
    fragment ProposalPageDiscussions_proposal on Proposal {
      id
      publicationStatus
      form {
        id
        commentable
      }
      ...ProposalPageComments_proposal
    }
  `,
})
