// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, FormattedDate, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useDisclosure } from '@liinkiing/react-hooks';
import moment from 'moment';
import styled, { type StyledComponent } from 'styled-components';
import { Button, Box, Flex, Skeleton } from '@cap-collectif/ui';
import { Link, useLocation } from 'react-router-dom';
import { getBaseUrl } from '~/config';
import colors from '~/utils/colors';
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes';
import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { ProposalPageHeader_proposal } from '~relay/ProposalPageHeader_proposal.graphql';
import type { ProposalPageHeader_step } from '~relay/ProposalPageHeader_step.graphql';
import type { ProposalPageHeader_viewer } from '~relay/ProposalPageHeader_viewer.graphql';
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy';
import ProposalPageHeaderButtons from './ProposalPageHeaderButtons';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground';
import { getBaseUrlFromStepUrl } from '~/utils/router';
import ModalProposalIllustration from '~/components/Proposal/Page/Header/ModalProposalIllustration';

type Props = {
  title: ?string,
  proposal: ProposalPageHeader_proposal,
  viewer: ?ProposalPageHeader_viewer,
  step: ?ProposalPageHeader_step,
  opinionCanBeFollowed: boolean,
  hasVotableStep: boolean,
  hasAnalysingButton?: boolean,
  onAnalysisClick?: () => void,
  shouldDisplayPictures: boolean,
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

    > .default-header {
      border-radius: 20px;
      overflow: hidden;
      height: 310px;
      position: relative;

      svg {
        position: absolute;
        left: calc(50% - 75px);
        top: calc(50% - 75px);
        z-index: 2;
      }

      #background {
        position: initial;
        height: 100%;
      }
    }

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      padding-top: 0;

      > .default-header {
        border-radius: 0;
      }

      #background {
        margin-left: -10%;
      }
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
`;

const About: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-left: 5px;

  div:first-child {
    font-weight: 600;
  }
`;

const HeaderActions: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  z-index: 3;
  position: absolute;
  margin: 20px;
  display: flex;
  justify-content: space-between;
  width: 910px;
  max-width: calc(100% - 20px);

  > a,
  #side-analysis-open-button {
    text-decoration: none;
    background: #fff;
    padding: 3px 15px;
    border-radius: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    border: none;
    color: ${colors.primaryColor};
    height: 29px;
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
    #side-analysis-open-button {
      padding: 3px 10px;
    }
  }
`;

const AvatarPlaceholder = () => (
  <Flex direction="row" align="center">
    <Skeleton.Circle mb={1} size="45px" />
    <Box ml={4}>
      <Skeleton.Text size="sm" mb={2} width="115px" />
      <Skeleton.Text size="sm" width="200px" />
    </Box>
  </Flex>
);

const renderBackUrl = (originStepUrl?: ?string, defaultStepUrl: string, tradKeyToBack: ?string) => {
  const url = getBaseUrlFromStepUrl(originStepUrl || defaultStepUrl);
  return (
    <Link to={`/${url}`}>
      <Icon name={ICON_NAME.chevronLeft} size={9} color={colors.primaryColor} />
      {tradKeyToBack && <FormattedMessage id={tradKeyToBack} />}
    </Link>
  );
};

export const ProposalPageHeader = ({
  proposal,
  step,
  viewer,
  opinionCanBeFollowed,
  hasVotableStep,
  hasAnalysingButton,
  onAnalysisClick,
  shouldDisplayPictures,
}: Props) => {
  const date = proposal?.publishedAt ? proposal?.publishedAt : proposal?.createdAt;
  const icon = shouldDisplayPictures ? proposal?.category?.icon : null;
  const color = shouldDisplayPictures ? proposal?.category?.color || '#1E88E5' : '#C4C4C4';
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const { state } = useLocation();

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
  const tradKeyToBack =
    proposal?.form.objectType === 'PROPOSAL' && isInterpellationContextFromProposal(proposal)
      ? 'interpellation.back'
      : proposal?.form.objectType === 'PROPOSAL'
      ? 'proposal.back'
      : proposal?.form.objectType === 'ESTABLISHMENT'
      ? 'establishment-back'
      : proposal?.form.objectType === 'QUESTION'
      ? 'questions-list'
      : null;

  const proposalIllustrationInitialValues = {
    media: proposal?.media || null,
  };

  return (
    <Header id="ProposalPageHeader">
      <div>
        <HeaderActions>
          {renderBackUrl(
            state?.stepUrl,
            proposal?.form?.step?.url?.replace(getBaseUrl(), '') || '',
            tradKeyToBack,
          )}
          <div>
            {hasAnalysingButton && (
              <button type="button" id="side-analysis-open-button" onClick={onAnalysisClick}>
                <Icon name={ICON_NAME.chart} size={16} color={colors.primaryColor} />
                {intl.formatMessage({ id: 'panel.analysis.subtitle' })}
              </button>
            )}
            {proposal?.form?.usingIllustration &&
              proposal.author.isViewer &&
              proposal.form.step &&
              proposal.form.step.state === 'CLOSED' && (
                <>
                  <Button
                    id="edit-illustration"
                    onClick={onOpen}
                    variant="secondary"
                    variantColor="primary"
                    variantSize="small"
                    leftIcon="PICTURE_O">
                    {intl.formatMessage({ id: 'edit-image' })}
                  </Button>
                  <ModalProposalIllustration
                    show={isOpen}
                    initialValues={proposalIllustrationInitialValues}
                    onClose={onClose}
                    proposalId={proposal.id}
                  />
                </>
              )}
          </div>
        </HeaderActions>
        {proposal?.media?.url || proposal?.category?.categoryImage?.image?.url ? (
          <Cover
            src={proposal?.media?.url || proposal?.category?.categoryImage?.image?.url}
            alt="proposal-illustration"
          />
        ) : (
          <div className="default-header">
            {icon && <Icon name={ICON_NAME[icon]} size={150} color={colors.white} />}
            <CategoryBackground color={color} viewBox="0 0 230 75" />
          </div>
        )}
        <Informations>
          <h1>{proposal?.title}</h1>
          <Skeleton placeholder={<AvatarPlaceholder />} isLoaded={proposal !== null}>
            <Flex direction="row">
              <UserAvatarLegacy user={proposal?.author} />
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
            </Flex>
          </Skeleton>
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
  shouldDisplayPictures: state.default.features.display_pictures_in_depository_proposals_list,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageHeader);

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
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...ProposalPageHeaderButtons_step @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  proposal: graphql`
    fragment ProposalPageHeader_proposal on Proposal
    @argumentDefinitions(
      isAuthenticated: { type: "Boolean!" }
      proposalRevisionsEnabled: { type: "Boolean!" }
    ) {
      id
      ...TrashedMessage_contribution
      ...UnpublishedLabel_publishable
      ...ProposalPageHeaderButtons_proposal
        @arguments(
          isAuthenticated: $isAuthenticated
          proposalRevisionsEnabled: $proposalRevisionsEnabled
        )
      title
      media {
        url
      }
      category {
        icon
        color
        categoryImage {
          image {
            url
          }
        }
      }
      author {
        username
        isViewer @include(if: $isAuthenticated)
        ...UserAvatarLegacy_user
      }
      createdAt
      publishedAt
      updatedAt
      url
      form {
        objectType
        usingIllustration
        step {
          url
          state
        }
      }
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
});
