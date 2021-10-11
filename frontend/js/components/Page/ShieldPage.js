// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { isSubmitting, submit } from 'redux-form';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { graphql, QueryRenderer } from 'react-relay';
import type { Dispatch, State } from '~/types';
import LoginButton from '../User/Login/LoginButton';
import LoginBox from '../User/Login/LoginBox';
import RegistrationButton from '../User/Registration/RegistrationButton';
import RegistrationModal from '~/components/User/Registration/RegistrationModal';
import LoginModal from '~/components/User/Login/LoginModal';
import { loginWithOpenID } from '~/redux/modules/default';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { ShieldPageQueryResponse } from '~relay/ShieldPageQuery.graphql';

type Props = {|
  showRegistration: boolean,
  submitting: boolean,
  loginWithOpenId: boolean,
  byPassAuth: boolean,
  onSubmit: (e: Event) => void,
  locale: string,
|};

const getShieldBody = ({
  showRegistration,
  submitting,
  byPassAuth,
  loginWithOpenId,
  onSubmit,
}: Props): React.Node => {
  if (showRegistration && !loginWithOpenId) {
    return (
      <>
        <LoginButton className="btn--connection btn-block" />
        <div className="mt-10" />
        <RegistrationButton className="btn-block" />
      </>
    );
  }

  if (byPassAuth) {
    return <LoginBox prefix="" />;
  }

  return (
    <form id="login-form" onSubmit={onSubmit}>
      <LoginBox prefix="" />
      <Button
        id="confirm-login"
        type="submit"
        className="mt-10 btn-block btn-success"
        disabled={submitting}
        bsStyle="primary">
        {submitting ? (
          <FormattedMessage id="global.loading" />
        ) : (
          <FormattedMessage id="global.login_me" />
        )}
      </Button>
    </form>
  );
};

const renderRegistrationForm = ({
  error,
  props,
  locale,
}: {
  ...ReactRelayReadyState,
  props: ?ShieldPageQueryResponse,
  locale: string,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }

  if (props) return <RegistrationModal query={props} locale={locale} />;

  return null;
};

export const ShieldPage = (shieldBodyProps: Props) => {
  const { locale } = shieldBodyProps;
  return (
    <div id="shield-agent" className="bg-white col-md-4 col-md-offset-4 panel panel-default">
      <LoginModal />

      <QueryRenderer
        environment={environment}
        query={graphql`
          query ShieldPageQuery {
            ...RegistrationModal_query
          }
        `}
        variables={{}}
        render={({ error, props, retry }) =>
          renderRegistrationForm({ error, props, retry, locale })
        }
      />

      <div className="panel-body">{getShieldBody(shieldBodyProps)}</div>
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  showRegistration: state.default.features.registration,
  byPassAuth: state.default.features.sso_by_pass_auth,
  loginWithOpenId: loginWithOpenID(state.default.ssoList),
  submitting: isSubmitting('login')(state),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (e: Event) => {
    e.preventDefault();
    dispatch(submit('login'));
  },
});
const connector = connect<any, any, _, _, _, _>(mapStateToProps, mapDispatchToProps);
export default connector(ShieldPage);
