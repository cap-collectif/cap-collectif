// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useDispatch, useSelector } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Container,
  LogoContainer,
  ContentContainer,
  Symbols,
  BackLink,
} from './UserInvitationPage.style';
import type { GlobalState } from '~/types';
import RegistrationForm, { form } from '~/components/User/Registration/RegistrationForm';
import SubmitButton from '~/components/Form/SubmitButton';
import type { UserInvitationPage_query$key } from '~relay/UserInvitationPage_query.graphql';
import type { UserInvitationPage_logo$key } from '~relay/UserInvitationPage_logo.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon from '~ds/Icon/Icon';
import ChartModal from "~/components/User/Registration/ChartModal";

type RelayProps = {|
  +queryFragmentRef: UserInvitationPage_query$key,
  +logoFragmentRef: UserInvitationPage_logo$key,
|};

type ComponentProps = {|
  +email: string,
  +token: string,
  +hasEnabledSSO: boolean,
  +primaryColor: string,
  +btnTextColor: string,
  +backgroundColor: string,
|};

type Props = {|
  ...ComponentProps,
  ...RelayProps,
|};

const QUERY_FRAGMENT = graphql`
  fragment UserInvitationPage_query on Query {
    ...RegistrationForm_query
  }
`;

const LOGO_FRAGMENT = graphql`
  fragment UserInvitationPage_logo on SiteImage {
    media {
      url(format: "reference")
    }
  }
`;

export const UserInvitationPage = ({
  email,
  token,
  queryFragmentRef,
  logoFragmentRef,
  hasEnabledSSO,
  primaryColor,
  btnTextColor,
  backgroundColor,
}: Props) => {
  const intl = useIntl();

  const query = useFragment(QUERY_FRAGMENT, queryFragmentRef);
  const logo = useFragment(LOGO_FRAGMENT, logoFragmentRef);

  const { organizationName, submitting } = useSelector((state: GlobalState) => {
    return {
      organizationName: state.default.parameters['global.site.organization_name'],
      submitting: isSubmitting(form)(state),
    };
  });

  const dispatch = useDispatch();

  const onSubmit = () => dispatch(submit(form));

  return (
    <Container>
      <ContentContainer primaryColor={primaryColor} btnText={btnTextColor}>
        {hasEnabledSSO && (
          <Flex alignItems="center" mb={4}>
            <Icon name="LONG_ARROW_LEFT" size="sm" />
            <BackLink to="/sso">{intl.formatMessage({ id: 'global.back' })}</BackLink>
          </Flex>
        )}
        <h1>
          <FormattedMessage id="global-welcome" /> 👋
        </h1>

        <p className="welcome">
          <FormattedMessage
            id="invite-join-platform"
            values={{
              organizationName,
            }}
          />
        </p>

        <ChartModal />
        <RegistrationForm invitationToken={token} email={email} query={query} />

        <SubmitButton
          id="confirm-register"
          label="create-account"
          isSubmitting={submitting}
          onSubmit={onSubmit}
          className="btn-submit"
        />
      </ContentContainer>

      <LogoContainer bgColor={backgroundColor}>
        <Symbols />
        {logo.media?.url && <img src={logo.media.url} alt={`logo ${organizationName}`} />}
      </LogoContainer>
    </Container>
  );
};

export default UserInvitationPage;
