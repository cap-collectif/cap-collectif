// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import SSOButton from '~/components/User/Invitation/SSOButton';
import { Symbols } from '~/components/User/Invitation/UserInvitationPage.style';
import {
  ButtonsContainer,
  Container,
  LeftSide,
  LeftSideInner,
  Line,
  RigthSide,
  Logo,
  WelcomeMessage,
} from '~/components/User/Invitation/UserInvitationSSOPage.style';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import type { GlobalState } from '~/types';
import type { UserInvitationSSOPage_logo$key } from '~relay/UserInvitationSSOPage_logo.graphql';
import CreateAccountEmailLink from '~/components/User/Invitation/CreateAccountEmailLink';

type Props = {|
  +loginFacebook: boolean,
  +loginFranceConnect: boolean,
  +loginParis: boolean,
  +ssoList: any,
  +isRegistrationAllowed: boolean,
  +logoFragmentRef: UserInvitationSSOPage_logo$key,
  +primaryColor: string,
  +btnTextColor: string,
  +backgroundColor: string,
  +setFirstVisited: (visited: boolean) => void,
  +token: string,
|};

const LOGO_FRAGMENT = graphql`
  fragment UserInvitationSSOPage_logo on SiteImage {
    media {
      url(format: "reference")
    }
  }
`;

const UserInvitationSSOPage = ({
  loginFacebook,
  loginFranceConnect,
  loginParis,
  ssoList,
  isRegistrationAllowed,
  logoFragmentRef,
  primaryColor,
  btnTextColor,
  backgroundColor,
  setFirstVisited,
  token,
}: Props) => {
  React.useEffect(() => {
    setFirstVisited(true);
  }, [setFirstVisited]);

  const logo = useFragment(LOGO_FRAGMENT, logoFragmentRef);
  const intl = useIntl();

  const organizationName = useSelector(
    (state: GlobalState) => state.default.parameters['global.site.organization_name'],
  );
  const oauth2SwitchUser = useFeatureFlag('oauth2_switch_user');

  return (
    <Container>
      <LeftSide>
        <LeftSideInner>
          <WelcomeMessage>
            <Heading as="h2" color={primaryColor}>
              {intl.formatMessage({ id: 'global-welcome' })}{' '}
              <span role="img" aria-label={intl.formatMessage({ id: 'global-welcome' })}>
                👋
              </span>
            </Heading>
            <Text color="gray.900" fontSize={5} lineHeight="m">
              {intl.formatMessage({ id: 'invite-join-platform' }, { organizationName })}
            </Text>
          </WelcomeMessage>
          <ButtonsContainer direction="column" display="inline-flex" width="325px">
            <>
              {loginFacebook && (
                <SSOButton
                  type="facebook"
                  primaryColor={primaryColor}
                  btnTextColor={btnTextColor}
                />
              )}
              {loginFranceConnect && (
                <SSOButton
                  type="franceConnect"
                  primaryColor={primaryColor}
                  btnTextColor={btnTextColor}
                />
              )}
              {loginParis && (
                <SSOButton
                  type="loginParis"
                  primaryColor={primaryColor}
                  btnTextColor={btnTextColor}
                />
              )}
              {ssoList.map((sso, index) => {
                return (
                  <SSOButton
                    type={sso.type}
                    primaryColor={primaryColor}
                    key={index}
                    index={index}
                    btnTextColor={btnTextColor}
                    switchUserMode={oauth2SwitchUser}
                    text={sso?.name}
                  />
                );
              })}
            </>
            {!loginParis && isRegistrationAllowed && (
              <>
                <Flex alignItems="center" width="100%" mb={4}>
                  <Line />
                  <Text px={2} color="gray.900">
                    {intl.formatMessage({ id: 'global-or' })}
                  </Text>
                  <Line />
                </Flex>
                <CreateAccountEmailLink
                  index={ssoList.length}
                  primaryColor={primaryColor}
                  btnTextColor={btnTextColor}
                  to={{
                    pathname: '/',
                    search: `?token=${token}`,
                  }}>
                  {intl.formatMessage({ id: 'create-account-with-email' })}
                </CreateAccountEmailLink>
              </>
            )}
          </ButtonsContainer>
        </LeftSideInner>
      </LeftSide>

      <RigthSide
        width="50%"
        justifyContent="center"
        alignItems="center"
        position="relative"
        backgroundColor={backgroundColor}>
        <Symbols />
        <Logo src={logo.media?.url} alt="" />
      </RigthSide>
    </Container>
  );
};

export default UserInvitationSSOPage;
