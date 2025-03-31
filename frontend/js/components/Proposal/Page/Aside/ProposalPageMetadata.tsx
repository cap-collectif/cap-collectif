import { $Values } from 'utility-types'
import * as React from 'react'

import styled from 'styled-components'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedDate, FormattedNumber, useIntl } from 'react-intl'
import { Box, CapUIFontSize, Text, Tooltip } from '@cap-collectif/ui'
import moment from 'moment'
import colors from '~/utils/colors'
import ProposalDetailLikers from '../../Detail/ProposalDetailLikers'
import type { ProposalPageMetadata_proposal } from '~relay/ProposalPageMetadata_proposal.graphql'
import { Card, CategoryCircledIcon } from '~/components/Proposal/Page/ProposalPage.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { MetadataPlaceHolder } from './ProposalPageMetadata.placeholder'

const ProposalPageMetadataContainer = styled.div`
  padding: 20px;

  > div {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  > div > span {
    margin-left: 10px;
    max-width: 225px;
  }
`
const Element = styled.div<{
  iconOnly?: boolean
}>`
  display: flex;
  font-size: 16px;
  color: ${colors.darkText};
`
type Props = {
  proposal: ProposalPageMetadata_proposal
  showCategories: boolean
  showDistricts: boolean
  showNullEstimation: boolean
  showThemes: boolean
}
export const MetadataRow = ({
  name,
  size,
  ready,
  color,
  categorySize = 24,
  categoryPaddingTop = 7,
  categoryPaddingLeft = 7,
  children,
}: {
  name: $Values<typeof ICON_NAME>
  size: number
  ready: boolean
  color: string
  categorySize?: number
  categoryPaddingTop?: number
  categoryPaddingLeft?: number
  children: JSX.Element | JSX.Element[] | string
}) => (
  <Element>
    <CategoryCircledIcon size={categorySize} paddingLeft={categoryPaddingLeft} paddingTop={categoryPaddingTop}>
      <Icon name={name} size={size} color={color} />
    </CategoryCircledIcon>

    <Box ml="15px">
      <MetadataPlaceHolder ready={ready}>{children}</MetadataPlaceHolder>
    </Box>
  </Element>
)
export const ProposalPageMetadata = ({
  proposal,
  showCategories,
  showDistricts,
  showNullEstimation,
  showThemes,
}: Props) => {
  const intl = useIntl()
  const estimation = !proposal?.estimation && showNullEstimation ? 0 : proposal?.estimation
  const archivedDate = proposal.archiveLimitDate ? moment(proposal.archiveLimitDate) : null

  const getArchivedLabel = () => {
    if (!archivedDate) {
      return ''
    }

    if (proposal.isArchived) {
      return `${intl.formatMessage(
        {
          id: 'archived-the',
        },
        {
          date: archivedDate.format('DD/MM/YYYY'),
        },
      )}`
    }

    const now = moment().startOf('day')
    const days = archivedDate.diff(now, 'days')
    return `${intl.formatMessage(
      {
        id: 'count.block.daysLeft',
      },
      {
        count: days,
      },
    )}`
  }

  const numericVotesTotalCount = proposal?.votes?.totalCount ?? 0
  const paperVotesTotalCount = proposal?.paperVotesTotalCount ?? 0
  const votesTotalCount = numericVotesTotalCount + paperVotesTotalCount
  const voteThreshold = proposal.currentVotableStep?.voteThreshold ?? 0
  const hasReachedEnoughVotes = votesTotalCount >= voteThreshold
  const showArchiveLimitDate = proposal.archiveLimitDate && getArchivedLabel() && !hasReachedEnoughVotes
  return (
    <Card id="ProposalPageMetadata">
      {((showCategories && proposal?.category) ||
        (showDistricts && proposal?.district) ||
        proposal?.likers ||
        (showNullEstimation && proposal?.estimation) ||
        !proposal) && (
        <ProposalPageMetadataContainer>
          {showArchiveLimitDate && (
            <MetadataRow name={ICON_NAME.calendar} size={10} color={colors.primaryColor} ready={!!proposal}>
              {proposal.isArchived ? (
                <Text>{getArchivedLabel()}</Text>
              ) : (
                <Tooltip
                  label={
                    <Text fontSize={CapUIFontSize.Caption}>
                      {intl.formatMessage(
                        {
                          id: 'will-be-closed-at',
                        },
                        {
                          date: (
                            <FormattedDate
                              value={moment(archivedDate)}
                              weekday="long"
                              day="numeric"
                              month="long"
                              year="numeric"
                              hour="numeric"
                              minute="numeric"
                            />
                          ),
                        },
                      )}
                    </Text>
                  }
                >
                  <Text>{getArchivedLabel()}</Text>
                </Tooltip>
              )}
            </MetadataRow>
          )}
          {!proposal || (showThemes && proposal?.theme?.title) ? (
            <MetadataRow name={ICON_NAME.tag} size={10} color={colors.primaryColor} ready={!!proposal}>
              <Text>{proposal?.theme?.title || ''}</Text>
            </MetadataRow>
          ) : null}
          {!proposal || (showCategories && proposal?.category) ? (
            <MetadataRow name={ICON_NAME.tag} size={10} color={colors.primaryColor} ready={!!proposal}>
              <Text>{proposal?.category?.name || ''}</Text>
            </MetadataRow>
          ) : null}
          {!proposal || (showDistricts && proposal?.district) ? (
            <MetadataRow name={ICON_NAME.pin} size={10} color={colors.primaryColor} ready={!!proposal}>
              <Text>{proposal?.district?.name || ''}</Text>
            </MetadataRow>
          ) : null}
          {!proposal || (estimation !== null && typeof estimation !== 'undefined') ? (
            <MetadataRow name={ICON_NAME.accounting} size={10} color={colors.primaryColor} ready={!!proposal}>
              <FormattedNumber minimumFractionDigits={0} value={estimation || 0} style="currency" currency="EUR" />
            </MetadataRow>
          ) : null}
          {!proposal || proposal?.likers.length > 0 ? (
            <Element iconOnly>
              <Icon name={ICON_NAME.love} size={14} color={colors.dangerColor} />
              <ProposalDetailLikers size="22px" proposal={proposal} newDesign />
            </Element>
          ) : null}
          <MetadataRow name={ICON_NAME.hashtag} size={10} color={colors.primaryColor} ready={!!proposal}>
            {proposal?.reference || ''}
          </MetadataRow>
        </ProposalPageMetadataContainer>
      )}
    </Card>
  )
}
export default createFragmentContainer(ProposalPageMetadata, {
  proposal: graphql`
    fragment ProposalPageMetadata_proposal on Proposal {
      ...ProposalDetailEstimation_proposal
      ...ProposalDetailLikers_proposal
      id
      estimation
      theme {
        title
      }
      likers {
        id
      }
      category {
        name
      }
      district {
        name
      }
      reference
      archiveLimitDate
      isArchived
      currentVotableStep {
        title
        voteThreshold
      }
      votes(stepId: $stepId, first: 0) {
        totalCount
      }
      paperVotesTotalCount
    }
  `,
})
