// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedNumber, FormattedMessage } from 'react-intl';
import { Navbar, Button } from 'react-bootstrap';
import styled, { type StyledComponent, css } from 'styled-components';
import type { ProposalVoteBasketWidget_step } from '~relay/ProposalVoteBasketWidget_step.graphql';
import type { ProposalVoteBasketWidget_viewer } from '~relay/ProposalVoteBasketWidget_viewer.graphql';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes';
import withColors from '~/components/Utils/withColors';
import type { FeatureToggles, State } from '~/types';

export const BlockContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 15px;
  }
`;

export const InfoContainer: StyledComponent<
  { separate?: boolean, noMargin?: boolean, borderColor: string },
  {},
  HTMLDivElement,
> = styled.div`
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
`;

export const NavBar: StyledComponent<
  {
    collapsed: boolean,
    isBudget: boolean,
    backgroundColor: string,
    textColor: string,
    borderColor: string,
    buttonBgColor: string,
    buttonTextColor: string,
  },
  {},
  typeof Navbar,
> = styled(Navbar)`
  border-color: ${({ borderColor }) => borderColor};
  top: 50px;
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
`;

type Props = {
  step: ProposalVoteBasketWidget_step,
  viewer: ?ProposalVoteBasketWidget_viewer,
  votesPageUrl: string,
  voteBarBackgroundColor: string,
  voteBarTextColor: string,
  voteBarBorderColor: string,
  voteBarButtonBgColor: string,
  voteBarButtonTextColor: string,
  features: FeatureToggles,
};

export const ProposalVoteBasketWidget = ({
  votesPageUrl,
  step,
  viewer,
  voteBarBackgroundColor,
  voteBarTextColor,
  voteBarBorderColor,
  voteBarButtonBgColor,
  voteBarButtonTextColor,
  features,
}: Props) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const creditsSpent = viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsSpent : 0;
  const isBudget = step.voteType === 'BUDGET';
  const isInterpellation = isInterpellationContextFromStep(step);

  return (
    <NavBar
      fixedTop
      collapsed={collapsed}
      isBudget={isBudget}
      backgroundColor={voteBarBackgroundColor}
      textColor={voteBarTextColor}
      borderColor={voteBarBorderColor}
      buttonBgColor={voteBarButtonBgColor}
      buttonTextColor={voteBarButtonTextColor}>
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
                  <FormattedNumber
                    tagName="p"
                    minimumFractionDigits={0}
                    value={creditsSpent || 0}
                    style="currency"
                    currency="EUR">
                    {formattedNumber => <p>{formattedNumber}</p>}
                  </FormattedNumber>
                </InfoContainer>
              </BlockContainer>
              <BlockContainer>
                <InfoContainer separate borderColor={voteBarBorderColor}>
                  <FormattedMessage tagName="p" id="global-maximum" />
                  {step.budget ? (
                    <FormattedNumber
                      tagName="p"
                      minimumFractionDigits={0}
                      value={step.budget}
                      style="currency"
                      currency="EUR">
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
              <Icon
                name={isInterpellation ? ICON_NAME.vote : ICON_NAME.urne}
                size={25}
                color={voteBarTextColor}
              />
              <InfoContainer borderColor={voteBarBorderColor}>
                <FormattedMessage
                  tagName="p"
                  id={isInterpellation ? 'support.count_no_nb' : 'project.preview.counters.votes'}
                  values={{ num: 2, count: 2 }}
                />
                <p>{step?.viewerVotes?.totalCount || 0}</p>
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
                    noMargin={features.votes_min && step.votesMin}
                    borderColor={voteBarBorderColor}>
                    <FormattedMessage tagName="p" id="global-maximum" />
                    <p>{step.votesLimit}</p>
                  </InfoContainer>
                </BlockContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button bsStyle="default" className="widget__button " href={votesPageUrl}>
        <FormattedMessage
          id={isInterpellation ? 'project.supports.title' : 'project.votes.title'}
        />
      </Button>
    </NavBar>
  );
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(
  withColors(connect(mapStateToProps)(ProposalVoteBasketWidget)),
  {
    step: graphql`
      fragment ProposalVoteBasketWidget_step on ProposalStep {
        id
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
        }
        voteType
        votesLimit
        votesMin
        budget
        ...interpellationLabelHelper_step @relay(mask: false)
      }
    `,
    viewer: graphql`
      fragment ProposalVoteBasketWidget_viewer on User
        @argumentDefinitions(stepId: { type: "ID!" }) {
        id
        proposalVotes(stepId: $stepId) {
          totalCount
          creditsLeft
          creditsSpent
        }
      }
    `,
  },
);
