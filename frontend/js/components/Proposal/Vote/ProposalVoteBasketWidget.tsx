import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedNumber, FormattedMessage } from 'react-intl'
import { Navbar, Button } from 'react-bootstrap'

import styled, { css } from 'styled-components'
import type { ProposalVoteBasketWidget_step$data } from '~relay/ProposalVoteBasketWidget_step.graphql'
import type { ProposalVoteBasketWidget_viewer$data } from '~relay/ProposalVoteBasketWidget_viewer.graphql'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes'
import withColors from '~/components/Utils/withColors'
import type { FeatureToggles, State } from '~/types'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export const BlockContainer = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 15px;
  }
`
export const InfoContainer = styled.div<{
  separate?: boolean
  noMargin?: boolean
  borderColor: string
}>`
  margin-right: 15px;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    ${({ separate, noMargin, borderColor }) =>
      separate &&
      css`
        margin-left: ${noMargin ? '0' : '40px'};
        border-top: 1px solid ${borderColor};
        padding-top: 7px;
        padding-right: 15px;
        margin-right: 0;
      `};
  }

  p {
    font-size: 12px;
    margin: 0;
  }

  p:last-child {
    font-size: 14px;
    font-weight: bold;
  }
`
export const NavBar = styled(Navbar)<{
  collapsed: boolean
  isBudget: boolean
  backgroundColor: string
  textColor: string
  borderColor: string
  buttonBgColor: string
  buttonTextColor: string
  newNavbar: boolean
}>`
  border-color: ${({ borderColor }) => borderColor};
  top: ${({ newNavbar }) => (newNavbar ? '0px' : '50px')};
  z-index: ${({ newNavbar }) => (newNavbar ? '1041' : '1029')};
  text-transform: capitalize;
  max-height: 500px;
  transition: max-height 0.25s ease-in;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  ${({ collapsed }) =>
    collapsed &&
    css`
      max-height: 50px;
      overflow: hidden;
      transition: max-height 0.15s ease-out;
    `};

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      ${({ isBudget }) => isBudget && 'flex-direction: column'};
    }
  }

  .budget {
    @media (min-width: ${mediaQueryTablet.minWidth}) {
      border-right: 1px solid ${({ borderColor }) => borderColor};
      margin-right: 15px;
    }
  }

  > div > div {
    width: 100%;
  }

  > div > div > div {
    display: flex;
    min-height: 50px;
  }

  > div > div > div > div {
    display: flex;

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      ${({ isBudget }) => isBudget && 'flex-direction: column'};
    }
  }

  > div > div > div > div > div {
    display: flex;

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      ${({ isBudget }) => isBudget && 'margin-top: 7px'};
    }
  }

  .widget__button {
    font-size: 15px;
    font-weight: 600;
    background-color: ${({ buttonBgColor }) => buttonBgColor};
    color: ${({ buttonTextColor }) => buttonTextColor};
    border: 1px solid ${({ borderColor }) => borderColor};

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      outline: none;
      border: none;
      background: none;
      font-size: 14px;
      ${({ isBudget }) =>
        isBudget &&
        css`
          width: 100%;
          margin-top: 12px;
          border-top: 1px solid ${({ borderColor }) => borderColor};
          border-radius: 0;
          padding: 12px;
        `}
    }
  }

  > div > svg {
    display: none;

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      display: unset;
      position: absolute;
      right: 15px;
      top: 18px;
    }
  }

  .container {
    padding-top: 0;
    padding-bottom: 0;
  }
`

type Props = {
  step: ProposalVoteBasketWidget_step$data
  viewer: ProposalVoteBasketWidget_viewer$data | null | undefined
  voteBarBackgroundColor: string
  voteBarTextColor: string
  voteBarBorderColor: string
  voteBarButtonBgColor: string
  voteBarButtonTextColor: string
  features: FeatureToggles
  isAuthenticated: boolean
}

export const ProposalVoteBasketWidget = ({
  step,
  viewer,
  voteBarBackgroundColor,
  voteBarTextColor,
  voteBarBorderColor,
  voteBarButtonBgColor,
  voteBarButtonTextColor,
  features,
  isAuthenticated,
}: Props) => {
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const newNavbar = useFeatureFlag('new_navbar')
  const creditsSpent = viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsSpent : 0
  const isBudget = step.voteType === 'BUDGET'
  const isInterpellation = isInterpellationContextFromStep(step)
  const votesPageUrl = `/projects/${step.project?.slug || ''}/votes`
  useEffect(() => {
    const html = document.querySelector('html')
    if (html) html.classList.add(newNavbar ? 'has-new-vote-widget' : 'has-vote-widget')
    return () => {
      if (html) html.classList.remove(newNavbar ? 'has-new-vote-widget' : 'has-vote-widget')
    }
  }, [newNavbar])
  return (
    <NavBar
      fixedTop
      collapsed={collapsed}
      isBudget={isBudget}
      backgroundColor={voteBarBackgroundColor}
      textColor={voteBarTextColor}
      borderColor={voteBarBorderColor}
      buttonBgColor={voteBarButtonBgColor}
      buttonTextColor={voteBarButtonTextColor}
      newNavbar={newNavbar}
    >
      {isBudget && (
        <Icon
          name={collapsed ? ICON_NAME.chevronDown : ICON_NAME.chevronUp}
          size={17}
          color={voteBarButtonTextColor}
          onClick={() => setCollapsed(!collapsed)}
        />
      )}
      <div>
        <div>
          {isBudget && (
            <div className="budget">
              <BlockContainer>
                <Icon name={ICON_NAME.budget} size={25} color={voteBarTextColor} />
                <InfoContainer borderColor={voteBarBorderColor}>
                  <FormattedMessage tagName="p" id="project.votes.widget.spent" />
                  {/* @ts-ignore*/}
                  <FormattedNumber
                    tagName="p"
                    minimumFractionDigits={0}
                    value={creditsSpent || 0}
                    style="currency"
                    currency="EUR"
                  >
                    {formattedNumber => <p>{formattedNumber}</p>}
                  </FormattedNumber>
                </InfoContainer>
              </BlockContainer>
              <BlockContainer>
                <InfoContainer separate borderColor={voteBarBorderColor}>
                  <FormattedMessage tagName="p" id="global-maximum" />
                  {step.budget ? (
                    // @ts-ignore
                    <FormattedNumber
                      tagName="p"
                      minimumFractionDigits={0}
                      value={step.budget}
                      style="currency"
                      currency="EUR"
                    >
                      {formattedNumber => <p>{formattedNumber}</p>}
                    </FormattedNumber>
                  ) : (
                    <FormattedMessage tagName="p" id="project.votes.widget.no_value" />
                  )}
                </InfoContainer>
              </BlockContainer>
            </div>
          )}
          <div>
            <BlockContainer>
              <Icon name={isInterpellation ? ICON_NAME.vote : ICON_NAME.urne} size={25} color={voteBarTextColor} />
              <InfoContainer borderColor={voteBarBorderColor}>
                <FormattedMessage
                  tagName="p"
                  id={isInterpellation ? 'support.count_no_nb' : 'project.preview.counters.votes'}
                  values={{
                    num: step?.viewerVotes?.totalCount || 0,
                    count: step?.viewerVotes?.totalCount || 0,
                  }}
                />
                <p id="vote-counter">{step?.viewerVotes?.totalCount || 0}</p>
              </InfoContainer>
            </BlockContainer>
            <div>
              {features.votes_min && step.votesMin && (
                <BlockContainer>
                  <InfoContainer separate={isBudget} borderColor={voteBarBorderColor}>
                    <FormattedMessage tagName="p" id="global-minimum" />
                    <p>{step.votesMin || 0}</p>
                  </InfoContainer>
                </BlockContainer>
              )}
              {step.votesLimit && (
                <BlockContainer>
                  <InfoContainer
                    separate={isBudget}
                    // @ts-ignore
                    noMargin={features.votes_min && step.votesMin}
                    borderColor={voteBarBorderColor}
                  >
                    <FormattedMessage tagName="p" id="global-maximum" />
                    <p>{step.votesLimit}</p>
                  </InfoContainer>
                </BlockContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      {isAuthenticated && (
        <Button bsStyle="default" className="widget__button " href={votesPageUrl}>
          <FormattedMessage id={isInterpellation ? 'project.supports.title' : 'project.votes.title'} />
        </Button>
      )}
    </NavBar>
  )
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
  features: state.default.features,
})

export default createFragmentContainer(withColors(connect(mapStateToProps)(ProposalVoteBasketWidget)), {
  step: graphql`
    fragment ProposalVoteBasketWidget_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
      }
      project {
        slug
      }
      voteType
      votesLimit
      votesMin
      budget
      isProposalSmsVoteEnabled
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
  viewer: graphql`
    fragment ProposalVoteBasketWidget_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
      proposalVotes(stepId: $stepId) {
        totalCount
        creditsSpent
      }
    }
  `,
})
