import { Box, CapUIIcon, Card, CardContent, CardCover, CardCoverImage, CardCoverPlaceholder } from '@cap-collectif/ui'
import { FC } from 'react'
import { graphql, useFragment } from 'react-relay'
import { MobileProposalCard_proposal$key } from '@relay/MobileProposalCard_proposal.graphql'
import convertIconToDs from '@shared/utils/convertIconToDs'

const FRAGMENT = graphql`
  fragment MobileProposalCard_proposal on Proposal {
    id
    title
    url
    category {
      color
      icon
      categoryImage {
        image {
          url
        }
      }
    }
    media {
      url
    }
  }
`

type Props = {
  proposal: MobileProposalCard_proposal$key
  onClose: () => void
}

const MobileProposalCard: FC<Props> = ({ proposal: proposalKey, onClose }) => {
  const proposal = useFragment(FRAGMENT, proposalKey)

  if (!proposal) return null

  const icon = proposal.category?.icon
  const proposalCover = proposal.media?.url || proposal.category?.categoryImage?.image?.url

  return (
    <Box position="absolute" left="0" bottom="md" width="100%" px="md" zIndex={9999} onClick={onClose}>
      <Card format="horizontal">
        <CardCover>
          {proposalCover ? (
            <CardCoverImage src={proposalCover} />
          ) : (
            <CardCoverPlaceholder
              icon={icon ? convertIconToDs(icon) : CapUIIcon.BubbleO}
              color={proposal.category?.color || 'primary.base'}
            />
          )}
        </CardCover>
        <CardContent primaryInfo={proposal.title} href={proposal.url} />
      </Card>
    </Box>
  )
}

export default MobileProposalCard
