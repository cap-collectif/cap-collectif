import * as React from 'react'
import { connect } from 'react-redux'

import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import { Link, useParams } from 'react-router-dom'
import type { State, FeatureToggles } from '~/types'
import type { ProposalMapPopover_proposal } from '~relay/ProposalMapPopover_proposal.graphql'
import UserLink from '../../User/UserLink'
import { translateContent } from '@shared/utils/contentTranslator'
import colors from '~/utils/colors'
import { getBaseUrl } from '~/config'
import { bootstrapToHex } from '~/utils/bootstrapToHexColor'
import { getBaseUrlFromProposalUrl } from '~/utils/router'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { mediaQueryTablet } from '~/utils/sizes'
import { MAIN_BORDER_RADIUS_SIZE, MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import SimpleProposalBackground from './SimpleProposalBackground'

type Props = {
  proposal: ProposalMapPopover_proposal
  features: FeatureToggles
  isMobile?: boolean
}
export const PopoverContainer = styled.div<{
  isMobile?: boolean
}>`
  margin: ${({ isMobile }) => (isMobile ? '4px' : 0)};
  background: ${colors.white};
  height: 146px;
  border-top-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
  border-top-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
`
export const PopoverContent = styled.div`
  padding: 10px;
  position: relative;

  h4 + div > svg {
    position: absolute;
    left: 25px;
    z-index: 2;
  }

  svg[id*='background'] {
    height: 65px;
    min-width: 65px;
    width: 65px;
    margin-right: 15px;
    position: initial;
    z-index: 1;
    ${MAIN_BORDER_RADIUS};
  }

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    width: 100%;

    > a {
      /* stylelint-disable */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      width: 100%;
      text-overflow: ellipsis;
      visibility: visible;
    }
  }

  > div {
    display: flex;
    margin-top: 10px;
    align-items: center;

    > div {
      width: 100%;
    }
  }

  img {
    height: 65px;
    width: 65px;
    ${MAIN_BORDER_RADIUS};
    object-fit: cover;
    margin-right: 15px;
  }
`
export const Status = styled.div<{
  color: string
}>`
  text-align: center;
  background: ${({ color }) => color};
  color: ${colors.white};
  font-size: 10px;
  padding: 2px;
  border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: ${mediaQueryTablet.minWidth}) {
    /** Not found of this but the leaflet popup has tons of embedded css that I have to deal with  */
    margin: -1px;
  }
`
export const PopoverInfo = styled.div<{
  displayPicture?: boolean
}>`
  margin-bottom: 5px;
  font-size: 14px;
  display: flex;
  align-items: center;

  svg {
    margin-right: 10px;
  }

  span,
  a {
    white-space: nowrap;
    overflow: hidden;
    width: ${({ displayPicture }) => (displayPicture ? 'calc(100% - 100px)' : '100%')};
    text-overflow: ellipsis;
  }
`
export const ProposalMapPopover = ({ proposal, features, isMobile }: Props) => {
  const url = getBaseUrlFromProposalUrl(proposal.url)
  const { projectSlug } = useParams()
  return (
    <>
      <PopoverContainer isMobile={isMobile}>
        {proposal.status && <Status color={bootstrapToHex(proposal.status.color)}>{proposal.status?.name}</Status>}
        <PopoverContent>
          <h4>
            <Link
              to={{
                pathname: `/project/${projectSlug || ''}/${url}/${proposal.slug}`,
                state: {
                  currentVotableStepId: proposal.currentVotableStep?.id,
                  stepUrl: proposal.form?.step?.url.replace(getBaseUrl(), ''),
                },
              }}
            >
              {translateContent(proposal.title)}
            </Link>
          </h4>
          <div>
            {features.display_pictures_in_depository_proposals_list &&
              (proposal?.media?.url || proposal?.category?.categoryImage?.image?.url ? (
                <img
                  loading="lazy"
                  src={proposal.media ? proposal.media.url : proposal?.category?.categoryImage?.image?.url}
                  alt=""
                />
              ) : (
                <>
                  {proposal?.category?.icon && (
                    <Icon name={ICON_NAME[proposal?.category?.icon]} size={36} color={colors.white} />
                  )}
                  <SimpleProposalBackground
                    color={proposal?.category?.color || '#1E88E5'}
                    id={`background-${proposal.url}`}
                  />
                </>
              ))}
            <div>
              {proposal.category && (
                <PopoverInfo displayPicture={features.display_pictures_in_depository_proposals_list}>
                  <Icon name={ICON_NAME.tag} size={12} color={colors.iconGrayColor} />
                  <span>{proposal.category.name}</span>
                </PopoverInfo>
              )}
              <PopoverInfo displayPicture={features.display_pictures_in_depository_proposals_list}>
                <Icon name={ICON_NAME.newUser} size={12} color={colors.iconGrayColor} />
                {/** @ts-ignore */}
                <UserLink user={proposal.author} />
              </PopoverInfo>
            </div>
          </div>
        </PopoverContent>
      </PopoverContainer>
    </>
  )
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
})

export default createFragmentContainer(connect(mapStateToProps)(ProposalMapPopover), {
  proposal: graphql`
    fragment ProposalMapPopover_proposal on Proposal {
      title
      slug
      url
      media {
        url
      }
      form {
        step {
          url
        }
      }
      category {
        name
        icon
        color
        categoryImage {
          image {
            url
          }
        }
      }
      currentVotableStep {
        id
      }
      status(step: $stepId) {
        name
        color
      }
      author {
        ...UserLink_user
      }
    }
  `,
})
