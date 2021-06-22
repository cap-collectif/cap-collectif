// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { Card } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { styleGuideColors } from '~/utils/colors';
import type { ProposalSocialNetworkLinks_proposal } from '~relay/ProposalSocialNetworkLinks_proposal.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';

type Props = {|
  proposal: ProposalSocialNetworkLinks_proposal,
  intl: IntlShape,
|};

const ProposalSocialNetworkLinksContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px 30px;
  a {
    margin-right: 24px;
    margin-top: 16px;
  }
`;

export const ProposalSocialNetworkLinks = ({ proposal }: Props) => {
  return (
    <Card id="ProposalSocialNetworkLinks">
      <ProposalSocialNetworkLinksContainer>
        <Text as="h4" mb="0" color={styleGuideColors.gray900} fontWeight="700" fontSize="18px">
          <FormattedMessage id="find-us" />
        </Text>
        <AppBox lineHeight="48px">
          {proposal.form.usingTwitter && proposal.twitterUrl && (
            <a href={proposal.twitterUrl} rel="noreferrer" target="_blank">
              <Icon width="32px" height="32px" name={ICON_NAME.rsTwitter} />
            </a>
          )}
          {proposal.form.usingFacebook && proposal.facebookUrl && (
            <a href={proposal.facebookUrl} rel="noreferrer" target="_blank">
              <Icon width="32px" height="32px" name={ICON_NAME.rsFacebook} />
            </a>
          )}
          {proposal.form.usingInstagram && proposal.instagramUrl && (
            <a href={proposal.instagramUrl} rel="noreferrer" target="_blank">
              <img src='/rs-instagram.png' alt="instagram" />
            </a>
          )}
          {proposal.form.usingLinkedIn && proposal.linkedInUrl && (
            <a href={proposal.linkedInUrl} rel="noreferrer" target="_blank">
              <Icon width="32px" height="32px" name={ICON_NAME.rsLinkedin} />
            </a>
          )}
          {proposal.form.usingYoutube && proposal.youtubeUrl && (
            <a href={proposal.youtubeUrl} rel="noreferrer" target="_blank">
              <Icon width="32px" height="32px" name={ICON_NAME.rsYoutube} />
            </a>
          )}
          {proposal.form.usingWebPage && proposal.webPageUrl && (
            <a href={proposal.webPageUrl} rel="noreferrer" target="_blank">
              <Icon width="32px" height="32px" name={ICON_NAME.rsWebPage} />
            </a>
          )}
        </AppBox>
      </ProposalSocialNetworkLinksContainer>
    </Card>
  );
};

const container = injectIntl(ProposalSocialNetworkLinks);

// Prepare with the api PR #12755
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalSocialNetworkLinks_proposal on Proposal {
      twitterUrl
      webPageUrl
      facebookUrl
      instagramUrl
      linkedInUrl
      youtubeUrl
      form {
        usingFacebook
        usingWebPage
        usingTwitter
        usingInstagram
        usingYoutube
        usingLinkedIn
      }
    }
  `,
});
