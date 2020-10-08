// @flow
import React from 'react';
import ReactPlaceholder from 'react-placeholder';
import { RoundShape, TextRow } from 'react-placeholder/lib/placeholders';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes';
import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { ProposalPageHeader_proposal } from '~relay/ProposalPageHeader_proposal.graphql';
import type { ProposalPageHeader_step } from '~relay/ProposalPageHeader_step.graphql';
import type { ProposalPageHeader_viewer } from '~relay/ProposalPageHeader_viewer.graphql';
import UserAvatar from '~/components/User/UserAvatar';
import ProposalPageHeaderButtons from './ProposalPageHeaderButtons';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';

type Props = {
  title: string,
  proposal: ProposalPageHeader_proposal,
  viewer: ?ProposalPageHeader_viewer,
  step: ?ProposalPageHeader_step,
  opinionCanBeFollowed: boolean,
  hasVotableStep: boolean,
  referer: string,
  hasAnalysingButton?: boolean,
  onAnalysisClick?: () => void,
};

const Header: StyledComponent<{}, {}, HTMLElement> = styled.header`
  border-bottom: 1px solid ${colors.lightGray};
  padding-bottom: 30px;
  background-color: ${colors.white};

  > div {
    width: 100%;
    max-width: 950px;
    margin: auto;
    background-color: ${colors.white};
    padding-top: 25px;

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      padding-top: 0;
    }
  }
`;

const Cover: StyledComponent<{}, {}, HTMLImageElement> = styled.img`
  width: 100%;
  height: 310px;
  border-radius: 6px;
  object-fit: cover;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    border-radius: 0;
  }
`;

const Informations: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin: 15px;

  @media (min-width: ${bootstrapGrid.mdMin}px) {
    max-width: 587px;
    margin: 0;
    margin-top: 15px;
  }

  h1 {
    font-size: 30px;
    font-weight: 600;
    margin-bottom: 20px;
    color: ${colors.darkText};
    word-break: break-word;
  }

  h1 + div {
    display: flex;
  }
`;

const About: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-left: 5px;

  div:first-child {
    font-weight: 600;
  }
`;

const HeaderActions: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: absolute;
  margin: 20px;
  display: flex;
  justify-content: space-between;
  width: 910px;
  max-width: calc(100% - 20px);

  > a,
  > button {
    text-decoration: none;
    background: #fff;
    padding: 3px 15px;
    border-radius: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    border: none;
    color: ${colors.primaryColor};

    span {
      margin-left: 5px;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 200px;

    span {
      display: none;
    }

    > a,
    > button {
      padding: 3px 10px;
    }
  }
`;

const avatarPlaceholder = (
  <div style={{ display: 'flex' }}>
    <RoundShape color={colors.borderColor} style={{ width: 45, height: 45 }} />
    <div style={{ marginLeft: 15 }}>
      <TextRow color={colors.borderColor} style={{ width: 115, height: 15, marginTop: 5 }} />
      <TextRow color={colors.borderColor} style={{ width: 200, height: 12, marginTop: 10 }} />
    </div>
  </div>
);

export const ProposalPageHeader = ({
  proposal,
  step,
  viewer,
  title,
  opinionCanBeFollowed,
  hasVotableStep,
  referer,
  hasAnalysingButton,
  onAnalysisClick,
}: Props) => {
  const date = proposal?.publishedAt ? proposal?.publishedAt : proposal?.createdAt;
  const createdDate = (
    <FormattedDate
      value={moment(date)}
      day="numeric"
      month="long"
      year="numeric"
      hour="numeric"
      minute="numeric"
    />
  );
  const modified = moment(proposal?.updatedAt).diff(proposal?.createdAt, 'seconds') > 1;
  const tradKeyToBack = proposal?.form.isProposalForm
    ? isInterpellationContextFromProposal(proposal)
      ? 'interpellation.back'
      : 'proposal.back'
    : 'questions-list';
  return (
    <Header id="ProposalPageHeader">
      <div>
        <HeaderActions>
          <a href={referer || proposal.url}>
            <Icon name={ICON_NAME.chevronLeft} size={9} color={colors.primaryColor} />
            <FormattedMessage id={tradKeyToBack} />
          </a>
          {hasAnalysingButton && (
            <button type="button" id="side-analysis-open-button" onClick={onAnalysisClick}>
              <Icon name={ICON_NAME.chart} size={16} color={colors.primaryColor} />
              <FormattedMessage id="panel.analysis.subtitle" />
            </button>
          )}
        </HeaderActions>
        <Cover
          src={
            proposal?.media?.url ||
            proposal?.category?.categoryImage?.image?.url ||
            '/svg/preview-proposal-image.svg'
          }
          alt="proposal-illustration"
        />
        <Informations>
          <h1>{title}</h1>
          <ReactPlaceholder
            showLoadingAnimation
            customPlaceholder={avatarPlaceholder}
            ready={proposal !== null}>
            <div>
              <UserAvatar user={proposal?.author} />
              <About>
                <div>{proposal?.author.username}</div>
                <div>
                  {createdDate}
                  {modified && (
                    <span>
                      {' • '}
                      <FormattedMessage id="proposal_form.notifications_comment.on_update" />
                    </span>
                  )}
                </div>
              </About>
            </div>
          </ReactPlaceholder>
        </Informations>
        <ProposalPageHeaderButtons
          proposal={proposal}
          step={step}
          viewer={viewer}
          opinionCanBeFollowed={opinionCanBeFollowed}
          hasVotableStep={hasVotableStep}
        />
      </div>
    </Header>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  referer: state.proposal.referer,
});

const container = connect(mapStateToProps)(ProposalPageHeader);

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment ProposalPageHeader_viewer on User
      @argumentDefinitions(hasVotableStep: { type: "Boolean", defaultValue: true }) {
      ...ProposalPageHeaderButtons_viewer
        @arguments(stepId: $stepId, hasVotableStep: $hasVotableStep)
    }
  `,
  step: graphql`
    fragment ProposalPageHeader_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
      ...ProposalPageHeaderButtons_step @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  proposal: graphql`
    fragment ProposalPageHeader_proposal on Proposal
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...TrashedMessage_contribution
      ...UnpublishedLabel_publishable
      ...ProposalPageHeaderButtons_proposal @arguments(isAuthenticated: $isAuthenticated)
      title
      media {
        url
      }
      category {
        name
        categoryImage {
          image {
            url
          }
        }
      }
      theme {
        title
      }
      author {
        username
        ...UserAvatar_user
      }
      createdAt
      publishedAt
      draft
      updatedAt
      url
      form {
        isProposalForm
        canContact
      }
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
});
