// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Container, LogoContainer, ContentContainer, Symbols } from './UserInvitationPage.style';
import type { UserInvitationPageAppProps } from '~/startup/UserInvitationPageApp';
import type { State, Dispatch } from '~/types';
import RegistrationForm, { form } from '~/components/User/Registration/RegistrationForm';
import SubmitButton from '~/components/Form/SubmitButton';
import type { UserInvitationPage_query } from '~relay/UserInvitationPage_query.graphql';
import type { UserInvitationPage_colors } from '~relay/UserInvitationPage_colors.graphql';
import type { UserInvitationPage_logo } from '~relay/UserInvitationPage_logo.graphql';

type StateProps = {|
  +organizationName: string,
  +submitting: boolean,
  +defaultColor: {|
    +defaultPrimaryColor: string,
    +defaultColorText: string,
  |},
|};

type DispatchProps = {|
  +onSubmit: () => typeof submit,
|};

type Props = {|
  ...StateProps,
  ...DispatchProps,
  ...UserInvitationPageAppProps,
  query: UserInvitationPage_query,
  colors: UserInvitationPage_colors,
  logo: UserInvitationPage_logo,
|};

export const UserInvitationPage = ({
  email,
  onSubmit,
  organizationName,
  token,
  submitting,
  query,
  colors,
  logo,
  defaultColor: { defaultPrimaryColor, defaultColorText },
}: Props) => {
  const primaryColor =
    colors.find(color => color.keyname === 'color.btn.primary.bg')?.value || defaultPrimaryColor;
  const btnText =
    colors.find(color => color.keyname === 'color.btn.primary.text')?.value || defaultColorText;

  return (
    <Container>
      <ContentContainer primaryColor={primaryColor} btnText={btnText}>
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

        <RegistrationForm invitationToken={token} email={email} query={query} />

        <SubmitButton
          id="confirm-register"
          label="create-account"
          isSubmitting={submitting}
          onSubmit={onSubmit}
          className="btn-submit"
        />
      </ContentContainer>

      <LogoContainer bgColor={primaryColor}>
        <Symbols />
        {logo.media?.url && <img src={logo.media.url} alt={`logo ${organizationName}`} />}
      </LogoContainer>
    </Container>
  );
};

const mapStateToProps = state => ({
  submitting: isSubmitting(form)(state),
  organizationName: state.default.parameters['global.site.organization_name'],
  defaultColor: {
    defaultPrimaryColor: state.default.parameters['color.btn.primary.bg'],
    defaultColorText: state.default.parameters['color.btn.primary.text'],
  },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: () => dispatch(submit(form)),
});

const UserInvitationPageConnected = connect<Props, State, _, StateProps, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(UserInvitationPage);

export default createFragmentContainer(UserInvitationPageConnected, {
  query: graphql`
    fragment UserInvitationPage_query on Query {
      ...RegistrationForm_query
    }
  `,
  colors: graphql`
    fragment UserInvitationPage_colors on SiteColor @relay(plural: true) {
      keyname
      value
    }
  `,
  logo: graphql`
    fragment UserInvitationPage_logo on SiteImage {
      media {
        url(format: "reference")
      }
    }
  `,
});
