import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  BoxProps,
  Card,
  CapUIIcon,
  CardCoverImage,
  CardCoverPlaceholder,
  CardCover,
  CardContent,
  CardProps,
  CapUIShadow,
} from '@cap-collectif/ui'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'
import stripHTML from '@shared/utils/stripHTML'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { useQueryState } from 'nuqs'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = BoxProps & {
  proposal: ProposalCard_proposal$key
  format?: CardProps['format']
  primaryInfoTag?: React.ElementType
  active?: boolean
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

export const ProposalCard: React.FC<Props> = ({ proposal: proposalKey, primaryInfoTag, active, ...props }) => {
  const proposal = useFragment(FRAGMENT, proposalKey)
  const { id, title, url, media, summary, body, category } = proposal
  const summaryOrBodyExcerpt = stripHTML((summary ?? body ?? '') as string) || ''

  const proposalCover = media?.url || category?.categoryImage?.image?.url
  const proposalIcon = category?.icon ? convertIconToDs(category?.icon) : CapUIIcon.BubbleO
  const proposalColor = category?.color || 'primary.base'

  const [listView] = useQueryState('list_view', { defaultValue: 'grid' })

  return (
    <Card
      id={`cap-proposal-card-${id}`}
      format={listView === 'grid' ? 'vertical' : 'horizontal'}
      maxWidth={listView === 'grid' ? ['unset', pxToRem(460), pxToRem(394)] : 'unset'}
      minWidth="unset"
      className={'cap-proposal-card' + (active ? ' active' : '')}
      sx={{ boxShadow: active ? CapUIShadow.Small : 'inherit' }}
      {...props}
    >
      <CardCover>
        {proposalCover ? (
          <CardCoverImage /*{...getSrcSet(proposalCover)}*/ src={proposalCover} />
        ) : (
          <CardCoverPlaceholder icon={proposalIcon} color={proposalColor} />
        )}
        {/* {renderTag(project, intl)} */}
      </CardCover>
      <CardContent primaryInfo={title} secondaryInfo={summaryOrBodyExcerpt} href={url} primaryInfoTag={'h2'}>
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
