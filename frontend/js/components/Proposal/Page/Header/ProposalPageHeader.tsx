import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage, FormattedDate, useIntl } from 'react-intl'
import { connect, useSelector } from 'react-redux'
import { useDisclosure } from '@liinkiing/react-hooks'
import moment from 'moment'
import convertIconToDs from '@shared/utils/convertIconToDs'
import styled from 'styled-components'
import { Button, Box, Flex, Skeleton, CapUIIcon, Icon, CapUIIconSize, Link } from '@cap-collectif/ui'
import { useLocation, useParams } from 'react-router-dom'
import { getBaseUrl } from '~/config'
import colors from '~/utils/colors'
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes'
import type { GlobalState } from '~/types'
import type { ProposalPageHeader_proposal$data } from '~relay/ProposalPageHeader_proposal.graphql'
import type { ProposalPageHeader_step$data } from '~relay/ProposalPageHeader_step.graphql'
import type { ProposalPageHeader_viewer$data } from '~relay/ProposalPageHeader_viewer.graphql'
import UserAvatar from '~/components/User/UserAvatar'
import ProposalPageHeaderButtons from './ProposalPageHeaderButtons'
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground'
import { getBaseLocale, getBaseUrlFromStepUrl } from '~/utils/router'
import ModalProposalIllustration from '~/components/Proposal/Page/Header/ModalProposalIllustration'
import Image from '~ui/Primitives/Image'
import useIsMobile from '@shared/hooks/useIsMobile'

type Props = {
  title: string | null | undefined
  proposal: ProposalPageHeader_proposal$data
  viewer: ProposalPageHeader_viewer$data | null | undefined
  step: ProposalPageHeader_step$data | null | undefined
  hasAnalysingButton?: boolean
  onAnalysisClick?: () => void
  shouldDisplayPictures: boolean
  platformLocale: string
}
const Header = styled.header`
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

      > svg {
        position: absolute;
        left: calc(50% - 32px);
        top: calc(50% - 32px);
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
`
const Cover = styled(Image)`
  width: 100%;
  height: 310px;
  border-radius: 6px;
  object-fit: cover;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    border-radius: 0;
  }
`
const Informations = styled.div`
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
`
const About = styled.div`
  margin-left: 5px;

  div:first-child {
    font-weight: 600;
  }
`
const HeaderActions = styled.div`
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
    display: flex;
    align-items: center;
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
`

const AvatarPlaceholder = () => (
  <Flex direction="row" align="center">
    <Skeleton.Circle mb={1} size="45px" />
    <Box ml={4}>
      <Skeleton.Text size="sm" mb={2} width="115px" />
      <Skeleton.Text size="sm" width="200px" />
    </Box>
  </Flex>
)

const BackUrl = ({
  originStepUrl,
  defaultStepUrl,
  tradKeyToBack,
  platformLocale,
}: {
  originStepUrl?: string | null | undefined
  defaultStepUrl: string
  tradKeyToBack: string | null | undefined
  stepId?: string
  platformLocale: string
  currentVotableStep?: string | null | undefined
}) => {
  const url = getBaseUrlFromStepUrl(originStepUrl || defaultStepUrl)
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage)
  const baseUrl = getBaseLocale(currentLanguage, platformLocale)
  const { projectSlug } = useParams<{ projectSlug?: string }>()

  const fullUrl = `${baseUrl}/project${!baseUrl ? `/${projectSlug || ''}` : ''}/${url}`

  const handleGoBack = () => {
    // !important: `fullUrl` won't work on mobile / mobile sized view
    // Detect if the user is on a mobile device or a small screen
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth < 768

    // If on mobile and there is a previous page in history, use the browser's back() which works better
    if (isMobile && window.history.length > 1) {
      window.history.back()
    } else {
      // navigate to `fullUrl` as defined in the parent component
      window.location.href = fullUrl
    }
  }

  return (
    <Link onClick={handleGoBack} sx={{cursor: 'pointer'}}> 
      <Icon name={CapUIIcon.ArrowLeftO} size={CapUIIconSize.Sm} color={colors.primaryColor} />
      {tradKeyToBack && <FormattedMessage id={tradKeyToBack} />}
    </Link>
  )
}

export const ProposalPageHeader = ({
  proposal,
  step,
  viewer,
  hasAnalysingButton,
  onAnalysisClick,
  shouldDisplayPictures,
  platformLocale,
}: Props) => {
  const isMobile = useIsMobile()
  const date = proposal?.publishedAt ? proposal?.publishedAt : proposal?.createdAt
  const icon = shouldDisplayPictures ? proposal?.category?.icon : null
  const color = shouldDisplayPictures ? proposal?.category?.color || '#1E88E5' : '#C4C4C4'
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  const { state } = useLocation<{ stepUrl?: string; stepId?: string, from?: string }>()
  const createdDate = (
    <FormattedDate value={moment(date) as unknown as Date} day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" />
  )
  const modified = moment(proposal?.updatedAt).diff(proposal?.createdAt, 'seconds') > 1

  const getGoBackButtonLabel = () => {
    return proposal?.form.objectType === 'PROPOSAL' && isInterpellationContextFromProposal(proposal)
    ? 'interpellation.back'
    : proposal?.form.objectType === 'PROPOSAL'
    ? 'proposal.back'
    : proposal?.form.objectType === 'ESTABLISHMENT'
    ? 'establishment-back'
    : proposal?.form.objectType === 'OPINION'
    ? 'opinions-list'
    : proposal?.form.objectType === 'QUESTION'
    ? 'questions-list'
    : null
  }

  const proposalIllustrationInitialValues = {
    media: proposal?.media || null,
  }


  const getGoBackUrl = (): string => {
    const lastStepContainingProposalUrl = proposal?.lastStepContainingProposal?.url

    // 1- If the user comes from the "my votes" view, we redirect them to the last step the proposal is in
    const comesFromVotesView = (state?.from && state.from?.includes('view=votes')) || (document?.referrer && document.referrer.includes('view=votes'))
    if (comesFromVotesView && lastStepContainingProposalUrl) {
      return lastStepContainingProposalUrl.replace(getBaseUrl(), '') || ''
    }

    // 2- If the user comes from a step, the link should redirect there
    // this works for the new vote step ("vue IDF")
    if (state?.from) {
      return state.from.replace(getBaseUrl(), '')
    }
    // this works for the old vote step
    if (document.referrer) {
      return document.referrer.replace(getBaseUrl(), '') || ''
       
    }

    // 3- If the user comes from a link, we want to redirect to the last step the proposal is in
    if (lastStepContainingProposalUrl) {
      return lastStepContainingProposalUrl.replace(getBaseUrl(), '')
    }

    return ''
  }

  return (
    <Header id="ProposalPageHeader">
      <div>
        <HeaderActions>
          <BackUrl
            currentVotableStep={proposal?.currentVotableStep?.slug}
            originStepUrl={getGoBackUrl()}
            defaultStepUrl={proposal?.form?.step?.url?.replace(getBaseUrl(), '') || ''}
            tradKeyToBack={getGoBackButtonLabel()}
            platformLocale={platformLocale}
          />
          <div>
            {hasAnalysingButton && (
              <button type="button" id="side-analysis-open-button" onClick={onAnalysisClick}>
                <Icon name={CapUIIcon.PieChart} size={CapUIIconSize.Sm} color="primary.base" />
                {intl.formatMessage({
                  id: 'panel.analysis.subtitle',
                })}
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
                    leftIcon={CapUIIcon.PictureO}
                  >
                    {intl.formatMessage({
                      id: 'edit-image',
                    })}
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
          <Cover src={proposal?.media?.url || proposal?.category?.categoryImage?.image?.url} alt="" loading="eager" />
        ) : (
          <div className="default-header">
            {icon && (
              <Icon
                name={convertIconToDs(icon)}
                size={CapUIIconSize.Xxl}
                color={colors.white}
                sx={{ scale: ['1', '2', '4'] }}
                aria-hidden
                focusable={false}
              />
            )}
            <CategoryBackground color={color} viewBox={isMobile? "0 0 75 75" :"0 0 230 75"} />
          </div>
        )}
        <Informations>
          <h1>{proposal?.title}</h1>
          <Skeleton placeholder={<AvatarPlaceholder />} isLoaded={proposal !== null}>
            <Flex direction="row">
              <UserAvatar
                user={proposal?.author}
                aria-describedby="proposal_author"
                role="img"
                aria-label={intl.formatMessage({ id: 'global.project_carrier' })}
              />
              <About>
                <div id="proposal_author">{proposal?.author.username}</div>
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
        <ProposalPageHeaderButtons proposal={proposal} step={step} viewer={viewer} />
      </div>
    </Header>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  shouldDisplayPictures: state.default.features.display_pictures_in_depository_proposals_list,
})

// @ts-ignore
const container = connect(mapStateToProps)(ProposalPageHeader)
export default createFragmentContainer(container, {
  viewer: graphql`
    fragment ProposalPageHeader_viewer on User
    @argumentDefinitions(hasVotableStep: { type: "Boolean", defaultValue: true }) {
      ...ProposalPageHeaderButtons_viewer @arguments(stepId: $stepId, hasVotableStep: $hasVotableStep)
    }
  `,
  step: graphql`
    fragment ProposalPageHeader_step on ProposalStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
      ...ProposalPageHeaderButtons_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    }
  `,
  proposal: graphql`
    fragment ProposalPageHeader_proposal on Proposal
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, proposalRevisionsEnabled: { type: "Boolean!" }) {
      id
      ...TrashedMessage_contribution
      ...UnpublishedLabel_publishable
      ...ProposalPageHeaderButtons_proposal
        @arguments(isAuthenticated: $isAuthenticated, proposalRevisionsEnabled: $proposalRevisionsEnabled)
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
        ...UserAvatar_user
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
      lastStepContainingProposal {
        url
      }
      currentVotableStep {
        slug
      }
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
})
