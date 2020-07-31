// @flow

import * as React from 'react';
import { usePreloadedQuery } from 'relay-hooks';
import { connect } from 'react-redux';
import { isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import * as S from '~/components/User/Invitation/UserInvitationPage.styles';
import type { UserInvitationPageAppProps } from '~/startup/UserInvitationPageApp';
import type { ResultPreloadQuery, State } from '~/types';
import RegistrationForm, { form } from '~/components/User/Registration/RegistrationForm';
import SubmitButton from '~/components/Form/SubmitButton';

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
  +prefetch: ResultPreloadQuery,
|};

export const UserInvitationPage = ({
  prefetch,
  email,
  onSubmit,
  organizationName,
  logo,
  token,
  submitting,
}: Props) => {
  const { props: data } = usePreloadedQuery(prefetch);
  return (
    <S.UserInvitationPageContainer>
      {data && (
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
          <RegistrationForm invitationToken={token} email={email} query={data} />
          <SubmitButton
            id="confirm-register"
            label="global.register"
            isSubmitting={submitting}
            onSubmit={onSubmit}
          />
        </S.UserInvitationPageFormContainer>
      )}
    </S.UserInvitationPageContainer>
  );
};

const mapStateToProps = state => ({
  submitting: isSubmitting(form)(state),
  organizationName: state.default.parameters['global.site.organization_name'],
});

const mapDispatchToProps = dispatch => ({
  onSubmit: () => dispatch(submit(form)),
});

export default connect<Props, State, _, StateProps, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(UserInvitationPage);
