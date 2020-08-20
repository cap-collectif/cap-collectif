// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import * as S from '~/components/User/Invitation/UserInvitationPage.styles';
import type { UserInvitationPageAppProps } from '~/startup/UserInvitationPageApp';
import type { State } from '~/types';
import RegistrationForm, { form } from '~/components/User/Registration/RegistrationForm';
import SubmitButton from '~/components/Form/SubmitButton';
import type { UserInvitationPage_query } from '~relay/UserInvitationPage_query.graphql';

type StateProps = {|
  +organizationName: string,
  +submitting: boolean,
|};

type DispatchProps = {|
  +onSubmit: () => typeof submit,
|};

type Props = {|
  ...StateProps,
  ...DispatchProps,
  ...UserInvitationPageAppProps,
  query: UserInvitationPage_query,
|};

export const UserInvitationPage = ({
  email,
  onSubmit,
  organizationName,
  logo,
  token,
  submitting,
  query,
}: Props) => (
  <S.UserInvitationPageContainer>
    <S.UserInvitationPageFormContainer>
      <S.UserInvitationPageFormHeader>
        <img src={logo} alt="" />
        <FormattedMessage
          id="you-have-been-invited-to"
          tagName="p"
          values={{
            organizationName,
          }}
        />
      </S.UserInvitationPageFormHeader>
      <RegistrationForm invitationToken={token} email={email} query={query} />
      <SubmitButton
        id="confirm-register"
        label="global.register"
        isSubmitting={submitting}
        onSubmit={onSubmit}
      />
    </S.UserInvitationPageFormContainer>
  </S.UserInvitationPageContainer>
);

const mapStateToProps = state => ({
  submitting: isSubmitting(form)(state),
  organizationName: state.default.parameters['global.site.organization_name'],
});

const mapDispatchToProps = dispatch => ({
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
});
