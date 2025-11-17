import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
// import { useIntl } from 'react-intl'
// import { formatCounter, renderTag } from './ProjectCard.utils'
import {
  BoxProps,
  Card,
  CapUIIcon,
  CardCoverImage,
  CardCoverPlaceholder,
  CardCover,
  CardContent,
  // CardTagList,
  CardProps,
} from '@cap-collectif/ui'
// import htmlDecode from '@shared/utils/htmlDecode'
// import { getSrcSet } from '@shared/ui/Image'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'
import stripHTML from '@shared/utils/stripHTML'
import convertIconToDs from '@shared/utils/convertIconToDs'

type Props = BoxProps & {
  proposal: ProposalCard_proposal$key
  format?: CardProps['format']
  primaryInfoTag?: React.ElementType
}

const FRAGMENT = graphql`
  fragment ProposalCard_proposal on Proposal {
    id
    title
    media {
      url
    }
    url
    body
    summary
    category {
      icon
      color
      categoryImage {
        image {
          url
        }
      }
    }
  }
`

export const ProposalCard = ({ proposal: proposalKey, primaryInfoTag, ...props }: Props) => {
  // const intl = useIntl()
  const proposal = useFragment(FRAGMENT, proposalKey)
  const { id, title, url, media, summary, body, category } = proposal
  const summaryOrBodyExcerpt = stripHTML((summary ?? body ?? '') as string) || ''

  const proposalCover = media?.url || category?.categoryImage?.image?.url
  const proposalIcon = category?.icon ? convertIconToDs(category?.icon) : CapUIIcon.BubbleO
  const proposalColor = category?.color || 'primary.base'

  return (
    <Card id={`cap-proposal-card-${id}`} className="cap-proposal-card" {...props}>
      <CardCover>
        {proposalCover ? (
          <CardCoverImage /*{...getSrcSet(proposalCover)}*/ src={proposalCover} />
        ) : (
          <CardCoverPlaceholder icon={proposalIcon} color={proposalColor} />
        )}
        {/* {renderTag(project, intl)} */}
      </CardCover>
      <CardContent primaryInfo={title} secondaryInfo={summaryOrBodyExcerpt} href={url} primaryInfoTag={primaryInfoTag}>
        TODO : les compteurs
        {/* {showCounters ? (
          <CardTagList>
            {((project.isVotesCounterDisplayable || isExternal) &&
              votesTotalCount &&
              formatCounter(
                CapUIIcon.ThumbUpO,
                votesTotalCount,
                intl.formatMessage({ id: 'project.votes.widget.votes' }),
              )) ||
              null}
            {((project.isContributionsCounterDisplayable || (isExternal && project.externalContributionsCount)) &&
              formatCounter(
                CapUIIcon.BubbleO,
                isExternal ? project.externalContributionsCount || 0 : project.contributions.totalCount,
                intl.formatMessage({ id: 'global.contribution' }),
              )) ||
              null}
            {((project.isParticipantsCounterDisplayable || (isExternal && externalParticipantsCount)) &&
              formatCounter(
                CapUIIcon.UserO,
                isExternal
                  ? externalParticipantsCount || 0
                  : project.contributors.totalCount +
                      project.anonymousVotes.totalCount +
                      project.anonymousReplies?.totalCount,
                intl.formatMessage({ id: 'capco.section.metrics.participants' }),
              )) ||
              null}
          </CardTagList>
        ) : null} */}
      </CardContent>
    </Card>
  )
}

export default ProposalCard
