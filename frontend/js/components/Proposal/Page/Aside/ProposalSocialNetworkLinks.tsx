import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import { FormattedMessage, useIntl } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Button, Box, Flex, Icon, CapUIIcon, CapUIIconSize, Text } from '@cap-collectif/ui'
import Help from '~/components/Ui/Form/Help/Help'
import { Card } from '~/components/Proposal/Page/ProposalPage.style'
import type { ProposalSocialNetworkLinks_proposal$key } from '~relay/ProposalSocialNetworkLinks_proposal.graphql'
import ModalProposalSocialNetworks from './ModalProposalSocialNetworks'
import Image from '~ui/Primitives/Image'
type Props = {
  readonly proposal: ProposalSocialNetworkLinks_proposal$key
}
const FRAGMENT = graphql`
  fragment ProposalSocialNetworkLinks_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    viewerDidAuthor @include(if: $isAuthenticated)
    twitterUrl
    webPageUrl
    facebookUrl
    instagramUrl
    linkedInUrl
    youtubeUrl
    id
    isProposalUsingAnySocialNetworks
    ...ModalProposalSocialNetworks_proposal
    form {
      numberOfUsedSocialNetworks
      isUsingAnySocialNetworks
      socialNetworksUsed
      usingFacebook
      usingWebPage
      usingTwitter
      usingInstagram
      usingYoutube
      usingLinkedIn
      step {
        state
      }
    }
  }
`
const ProposalSocialNetworkLinksContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  padding: 32px 24px;
  .flex-flow {
    flex-flow: wrap;
  }
  a {
    margin-right: 24px;
    margin-bottom: 16px;
  }
  a img {
    width: 32px;
    height: 32px;
  }
  a svg {
    margin: 0;
    padding: 0;
  }
`
const SNPlaceHolder: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  svg {
    padding: 0;
  }

  overflow-x: auto;
  width: 280px;
  font-size: 14px;
  line-height: 24px;
`
export const ProposalSocialNetworkLinks = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment)
  let socialNetworks = proposal.form.socialNetworksUsed
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const isAuthenticated = useSelector(state => state.user.user) != null

  // because webPage is the only one SN who have a translation
  if (!proposal.form.usingWebPage) {
    socialNetworks = socialNetworks.substr(2)
  }

  const initialValues = {
    webPageUrl: proposal.webPageUrl || null,
    facebookUrl: proposal.facebookUrl || null,
    twitterUrl: proposal.twitterUrl || null,
    instagramUrl: proposal.instagramUrl || null,
    linkedInUrl: proposal.linkedInUrl || null,
    youtubeUrl: proposal.youtubeUrl || null,
  }
  return (
    <Card id="ProposalSocialNetworkLinks">
      <ProposalSocialNetworkLinksContainer>
        <Text as="h4" mb="0" color="gray.900" fontWeight="700" fontSize="18px">
          {intl.formatMessage({
            id: proposal.isProposalUsingAnySocialNetworks ? 'find-us' : 'add-external-links',
          })}
        </Text>
        {proposal.isProposalUsingAnySocialNetworks && (
          <Flex wrap="wrap" mt={4} overflowX="auto" width="280px">
            {proposal.form.usingTwitter && proposal.twitterUrl && (
              <a href={proposal.twitterUrl} rel="noreferrer" target="_blank">
                <Icon size={CapUIIconSize.Lg} name={CapUIIcon.TwitterColored} />
              </a>
            )}
            {proposal.form.usingFacebook && proposal.facebookUrl && (
              <a href={proposal.facebookUrl} rel="noreferrer" target="_blank">
                <Icon size={CapUIIconSize.Lg} name={CapUIIcon.FacebookColored} />
              </a>
            )}
            {proposal.form.usingInstagram && proposal.instagramUrl && (
              <a href={proposal.instagramUrl} rel="noreferrer" target="_blank">
                <Image src="/rs-instagram.png" alt="instagram" />
              </a>
            )}
            {proposal.form.usingLinkedIn && proposal.linkedInUrl && (
              <a href={proposal.linkedInUrl} rel="noreferrer" target="_blank">
                <Icon size={CapUIIconSize.Lg} name={CapUIIcon.LinkedinColored} />
              </a>
            )}
            {proposal.form.usingYoutube && proposal.youtubeUrl && (
              <a href={proposal.youtubeUrl} rel="noreferrer" target="_blank">
                <Icon size={CapUIIconSize.Lg} name={CapUIIcon.YoutubeColored} />
              </a>
            )}
            {proposal.form.usingWebPage && proposal.webPageUrl && (
              <a href={proposal.webPageUrl} rel="noreferrer" target="_blank">
                <Icon size={CapUIIconSize.Lg} name={CapUIIcon.WebColored} />
              </a>
            )}
          </Flex>
        )}
        {!proposal.isProposalUsingAnySocialNetworks && proposal.form.isUsingAnySocialNetworks && (
          <SNPlaceHolder>
            <Help>
              {proposal.form.usingWebPage && <FormattedMessage id="form.label_website" />}
              {socialNetworks}
            </Help>
            <Box>
              {Array.from(Array(proposal.form.numberOfUsedSocialNetworks), () => (
                <Icon
                  size={CapUIIconSize.Lg}
                  padding={0}
                  mr={6}
                  mb={4}
                  name={CapUIIcon.WebColored} // TODO https://github.com/cap-collectif/ui/issues/153
                />
              ))}
            </Box>
          </SNPlaceHolder>
        )}
        {proposal.form.step && proposal.form.step.state === 'CLOSED' && proposal.viewerDidAuthor && (
          <>
            <Button
              leftIcon={proposal.isProposalUsingAnySocialNetworks ? CapUIIcon.Pencil : CapUIIcon.Add}
              justifyContent="center"
              width="256px"
              onClick={onOpen}
              variant="secondary"
              variantColor="hierarchy"
              variantSize="small"
            >
              {intl.formatMessage({
                id: proposal.isProposalUsingAnySocialNetworks ? 'global.edit' : 'global.add',
              })}
            </Button>
            <ModalProposalSocialNetworks
              show={isOpen}
              onClose={onClose}
              proposal={proposal}
              proposalType={proposal}
              initialValues={initialValues}
              proposalId={proposal.id}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}
      </ProposalSocialNetworkLinksContainer>
    </Card>
  )
}
export default ProposalSocialNetworkLinks
