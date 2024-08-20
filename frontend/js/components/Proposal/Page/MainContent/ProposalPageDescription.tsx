import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { Box, Skeleton } from '@cap-collectif/ui'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import type { ProposalPageDescription_proposal } from '~relay/ProposalPageDescription_proposal.graphql'
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style'

type Props = {
  proposal: ProposalPageDescription_proposal | null | undefined
}

const Placeholder = () => (
  <Box ml={4}>
    <Skeleton.Text size="sm" width="100%" mb={4} />
    <Skeleton.Text size="sm" width="50%" />
  </Box>
)

export const ProposalPageDescription = ({ proposal }: Props) => {
  if (proposal && !proposal.body && !proposal.summary) return null
  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={10}>
            <Icon name={ICON_NAME.fileText} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <FormattedMessage id="global.description" tagName="h3" />
        </CategoryTitle>
        {proposal?.summary && (
          <>
            <p
              style={{
                fontWeight: 600,
              }}
            >
              {' '}
              <WYSIWYGRender value={proposal.summary} />
            </p>
            <br />
          </>
        )}
        <Skeleton placeholder={<Placeholder />} isLoaded={proposal !== null}>
          <WYSIWYGRender value={proposal?.body} />
        </Skeleton>
      </CategoryContainer>
    </Card>
  )
}
export default createFragmentContainer(ProposalPageDescription, {
  proposal: graphql`
    fragment ProposalPageDescription_proposal on Proposal {
      body
      summary
    }
  `,
})
